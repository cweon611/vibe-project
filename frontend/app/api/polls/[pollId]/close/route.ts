import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ pollId: string }> },
) {
  const { pollId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: poll } = await supabase
    .from("polls")
    .select("*")
    .eq("id", pollId)
    .single();

  if (!poll) {
    return NextResponse.json({ error: "Poll not found" }, { status: 404 });
  }

  if (poll.status === "closed") {
    return NextResponse.json(
      { error: "Poll is already closed" },
      { status: 400 },
    );
  }

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("team_id", poll.team_id)
    .eq("user_id", user.id)
    .single();

  if (!member) {
    return NextResponse.json(
      { error: "Not a team member" },
      { status: 403 },
    );
  }

  const { error: closeError } = await supabase
    .from("polls")
    .update({ status: "closed" })
    .eq("id", pollId);

  if (closeError) {
    return NextResponse.json(
      { error: "Failed to close poll" },
      { status: 500 },
    );
  }

  const { data: allVotes } = await supabase
    .from("votes")
    .select("suggestion_id")
    .eq("poll_id", pollId);

  const totalVotes = allVotes?.length ?? 0;

  const voteCounts: Record<string, number> = {};
  for (const v of allVotes ?? []) {
    voteCounts[v.suggestion_id] = (voteCounts[v.suggestion_id] ?? 0) + 1;
  }

  const maxCount = Math.max(0, ...Object.values(voteCounts));
  let winningSuggestionId: string | null = null;

  if (maxCount > 0) {
    const topSuggestions = Object.entries(voteCounts)
      .filter(([, count]) => count === maxCount)
      .map(([id]) => id);

    winningSuggestionId =
      topSuggestions[Math.floor(Math.random() * topSuggestions.length)];
  } else {
    const { data: allSuggestions } = await supabase
      .from("menu_suggestions")
      .select("id")
      .eq("poll_id", pollId);

    if (allSuggestions && allSuggestions.length > 0) {
      winningSuggestionId =
        allSuggestions[Math.floor(Math.random() * allSuggestions.length)].id;
    }
  }

  if (!winningSuggestionId) {
    return NextResponse.json(
      { error: "No suggestions to determine a winner" },
      { status: 400 },
    );
  }

  const { data: result, error: resultError } = await supabase
    .from("poll_results")
    .insert({
      poll_id: pollId,
      winning_suggestion_id: winningSuggestionId,
      total_votes: totalVotes,
      decided_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (resultError) {
    return NextResponse.json(
      { error: "Failed to save result" },
      { status: 500 },
    );
  }

  return NextResponse.json(result);
}
