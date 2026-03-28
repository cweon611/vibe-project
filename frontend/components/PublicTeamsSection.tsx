import PublicTeamJoinCard, {
  type PublicTeamListItem,
} from "@/components/PublicTeamJoinCard";

export default function PublicTeamsSection({
  teams,
  defaultNickname,
}: {
  teams: PublicTeamListItem[];
  defaultNickname: string;
}) {
  if (teams.length === 0) {
    return (
      <section className="mt-10 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 text-center">
        <h2 className="text-lg font-semibold text-gray-900">공개 참여 팀</h2>
        <p className="mt-2 text-sm text-gray-500">
          아직 홈에 올라온 공개 팀이 없어요. 팀 만들 때「공개 팀」을 켜면 여기에
          표시돼요.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-gray-900">공개 참여 팀</h2>
      <p className="mt-1 text-sm text-gray-500">
        초대 코드 없이 닉네임만 넣고 바로 들어갈 수 있어요.
      </p>
      <div className="mt-4 space-y-3">
        {teams.map((team) => (
          <PublicTeamJoinCard
            key={team.id}
            team={team}
            defaultNickname={defaultNickname}
          />
        ))}
      </div>
    </section>
  );
}
