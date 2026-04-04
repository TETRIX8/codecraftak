import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization")!;
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user: caller } } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { data: callerRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin");

    if (!callerRoles || callerRoles.length === 0) {
      return new Response(JSON.stringify({ error: "Admin only" }), { status: 403, headers: corsHeaders });
    }

    const { userId } = await req.json();
    if (!userId) {
      return new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers: corsHeaders });
    }

    // Prevent self-deletion
    if (userId === caller.id) {
      return new Response(JSON.stringify({ error: "Cannot delete yourself" }), { status: 400, headers: corsHeaders });
    }

    // Prevent deleting other admins
    const { data: targetRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin");
    if (targetRoles && targetRoles.length > 0) {
      return new Response(JSON.stringify({ error: "Cannot delete admin" }), { status: 400, headers: corsHeaders });
    }

    // Delete all related data in order
    const tables = [
      { table: "point_transactions", column: "user_id" },
      { table: "user_badges", column: "user_id" },
      { table: "user_roles", column: "user_id" },
      { table: "user_bans", column: "user_id" },
      { table: "profile_likes", column: "liker_id" },
      { table: "profile_likes", column: "liked_id" },
      { table: "notifications", column: "user_id" },
      { table: "notifications", column: "sender_id" },
      { table: "game_invites", column: "sender_id" },
      { table: "game_invites", column: "recipient_id" },
      { table: "reviews", column: "reviewer_id" },
      { table: "appeals", column: "user_id" },
      { table: "attendance", column: "student_id" },
      { table: "attendance", column: "marked_by" },
    ];

    const deletedCounts: Record<string, number> = {};

    for (const { table, column } of tables) {
      const { data, error } = await supabase.from(table).delete().eq(column, userId).select("id");
      if (error) console.error(`Error deleting from ${table}.${column}:`, error.message);
      const key = `${table}.${column}`;
      deletedCounts[key] = data?.length ?? 0;
    }

    // Delete solutions (and their reviews first)
    const { data: userSolutions } = await supabase
      .from("solutions")
      .select("id")
      .eq("user_id", userId);

    if (userSolutions && userSolutions.length > 0) {
      const solutionIds = userSolutions.map((s) => s.id);
      // Delete reviews on user's solutions
      await supabase.from("reviews").delete().in("solution_id", solutionIds);
      // Delete appeals on user's solutions
      await supabase.from("appeals").delete().in("solution_id", solutionIds);
      // Delete solutions
      const { data: delSol } = await supabase.from("solutions").delete().eq("user_id", userId).select("id");
      deletedCounts["solutions"] = delSol?.length ?? 0;
    }

    // Delete messages
    const { data: delMsgs } = await supabase.from("messages").delete().eq("sender_id", userId).select("id");
    deletedCounts["messages"] = delMsgs?.length ?? 0;

    // Delete chat participations
    const { data: delPart } = await supabase.from("chat_participants").delete().eq("user_id", userId).select("id");
    deletedCounts["chat_participants"] = delPart?.length ?? 0;

    // Delete games
    await supabase.from("games").delete().eq("creator_id", userId);
    await supabase.from("games").delete().eq("opponent_id", userId);

    // Delete topics
    await supabase.from("topics").delete().eq("author_id", userId);

    // Delete profile
    await supabase.from("profiles").delete().eq("id", userId);

    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) {
      console.error("Error deleting auth user:", authError.message);
      return new Response(JSON.stringify({ error: "Failed to delete auth user: " + authError.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ success: true, deletedCounts }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
