export interface Team {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
  /** 홈 공개 참여 목록에 노출 */
  is_public?: boolean;
}

export interface Member {
  id: string;
  team_id: string;
  user_id: string;
  nickname: string;
  joined_at: string;
}

export interface Poll {
  id: string;
  team_id: string;
  date: string;
  status: "open" | "closed";
  deadline: string | null;
  created_at: string;
}

export interface MenuSuggestion {
  id: string;
  poll_id: string;
  name: string;
  suggested_by: string;
  created_at: string;
}

export interface Vote {
  id: string;
  poll_id: string;
  member_id: string;
  suggestion_id: string;
  voted_at: string;
}

export interface PollResult {
  id: string;
  poll_id: string;
  winning_suggestion_id: string;
  total_votes: number;
  decided_at: string;
}

export interface CurrentUser {
  id: string;
  email: string;
}
