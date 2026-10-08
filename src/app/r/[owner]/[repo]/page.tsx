import RepoView from "@/components/RepoView";
export default function Page({ params }: { params: { owner: string; repo: string } }) { return <RepoView owner={params.owner} name={params.repo} />; }
