import { Octokit } from "octokit";
import { Notice } from "obsidian";
import { MyPluginSettings } from 'main'

export async function sendComment(text: string, setting: MyPluginSettings) {
	// const { GH_TOKEN } = process.env
	let GH_TOKEN = setting.token 
	const octokit = new Octokit({ auth: GH_TOKEN });
	const { listForRepo, createComment, listComments } = octokit.rest.issues;

	const repoInfo = {
		owner: setting.username,
		repo: setting.repoName,
	};

	let username = "";

	// 获取用户名，这里是因为不支持顶层 await 所以包了一层
	(async () => {
		const {
			data: { login },
		} = await octokit.rest.users.getAuthenticated();
		username = login;
		console.log(username)
	})();

	type Await<T> = T extends Promise<infer R> ? R : T;
	type Issue = Await<ReturnType<typeof listForRepo>>["data"][0];

	// 因为 PR 也是 Issue，这里把所有的 PR 过滤掉
	async function getIssues() {
		const { data } = await listForRepo(repoInfo);
		return data.filter((s) => !s.pull_request);
	}

	async function commentIssue(issue: Issue, body: string) {
		await createComment({
			...repoInfo,
			issue_number: issue.number,
			body: body,
		});
	}

	function getDate() {
		let date = new Date();
		return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
	}

	async function getIssueComments(issue: Issue) {
		return (
			await listComments({
				...repoInfo,
				issue_number: issue.number,
			})
		).data;
	}

	async function isCommented(issue: Issue) {
		const comments = await getIssueComments(issue);
		return comments.some((s) => s.user!.login === username);
	}

	const templateText = text;

	// const issueArray = (await getIssues()).filter((s) =>
	//   s.title.includes(getDate())
	// )

	const issueArray = await getIssues();
	// if not issue, return
	if (issueArray.length === 0) return new Notice("no issue");

	const issue = issueArray[0];

	// if already commented, return
	// if (await isCommented(issue)) return new Notice("already commented");

	await commentIssue(issue, templateText);
	new Notice("comment success");
}
