import React, {useState} from "react";
import {RepositoryPageLayout} from "../../../../../lib/components/repository/layout";
import {AlertError, Loading} from "../../../../../lib/components/controls";
import {useRefs} from "../../../../../lib/hooks/repo";
import {useAPI, useAPIWithPagination} from "../../../../../lib/hooks/api";
import {cache, commits, refs} from "../../../../../lib/api";
import {ChangesTreeContainer, defaultGetMoreChanges} from "../../../../../lib/components/repository/changes";
import {useRouter} from "../../../../../lib/hooks/router";
import {URINavigator} from "../../../../../lib/components/repository/tree";
import {appendMoreResults} from "../../repo-comp/changes/changes";
import {CommitInfoCard} from "../../../../../lib/components/repository/commits";
import { repos } from "../../../../../lib/api/interface/Api";



const ChangeList = ({ repo, commit, prefix, onNavigate }) => {
    // const [actionError, setActionError] = useState(null);
    // const [afterUpdated, setAfterUpdated] = useState(""); // state of pagination of the item's children
    // const [resultsState, setResultsState] = useState({prefix: prefix, results:[], pagination:{}}); // current retrieved children of the item
    // const user = cache.get('user')
    // const delimiter = "/"
    console.log('testcommit:',commit);

    // const { error, loading, nextPage } = useAPIWithPagination(async () => {
    //     if (!repo) return
    //     if (!commit || commit.length === 0) return {results: [], pagination: {has_more: false}};

    //     return await appendMoreResults(resultsState, prefix, afterUpdated, setAfterUpdated, setResultsState,
    //         () => repos.getCommitDiff(user,repo.name, repo.head));
    // }, [repo.id, commit.hash, afterUpdated, prefix])

    // const results = resultsState.results

    // if (error) return <AlertError error={error}/>
    // if (loading) return <Loading/>

    // const actionErrorDisplay = (actionError) ?
    //     <AlertError error={actionError} onDismiss={() => setActionError(null)}/> : <></>

    // const commitSha = commit.hash.substring(0, 12);

    // const uriNavigator = <URINavigator path={prefix} reference={commit} repo={repo}
    //                                    relativeTo={`${commitSha}`}
    //                                    pathURLBuilder={(params, query) => {
    //                                        return {
    //                                            pathname: '/repositories/:repoId/commits/:commitId',
    //                                            params: {repoId: repo.name, commitId: commit.to_hash},
    //                                            query: {prefix: query.path}
    //                                        }
    //                                    }}/>
    // const changesTreeMessage = <p>Showing changes for commit <strong>{commitSha}</strong></p>
    return (    
        <>
            {/* {actionErrorDisplay} */}
            {/* <ChangesTreeContainer results={results} delimiter={delimiter} uriNavigator={uriNavigator} leftDiffRefID={commit.parents[0]}
                                  rightDiffRefID={commit.id} repo={repo} reference={commit} prefix={prefix}
                                  getMore={defaultGetMoreChanges(repo, commit.parents[0], commit.id, delimiter)}
                                  loading={loading} nextPage={nextPage} setAfterUpdated={setAfterUpdated} onNavigate={onNavigate}
                                  changesTreeMessage={changesTreeMessage}/> */}
        </>
    )
};

const CommitView = ({ repo, commitId, onNavigate, view, prefix,basedhash}) => {
    // pull commit itself
    const user = cache.get('user')
    const {response, loading, error} = useAPI(async () => {
        return await repos.getCommitDiff(user,repo.name,`${basedhash}...${commitId}`);
    }, [repo.name, commitId]);

    if (loading) return <Loading/>;
    if (error) return <AlertError error={error}/>;

    const results = response.data;

    return (
        results.map((commit)=>{
            return<div className="mb-5 mt-3">
            <CommitInfoCard repo={repo} commit={commit}/>
            <div className="mt-4">
                {/* <ChangeList
                    prefix={prefix}
                    view={(view) ? view : ""}
                    repo={repo}
                    commit={commit}
                    // onNavigate={onNavigate}
                /> */}
            </div>
        </div>
        })
       
    );
};

const CommitContainer = () => {
    const router = useRouter();
    const { repo, loading, error } = useRefs();
    const { prefix,ref,basedhash} = router.query;
    const { commitId ,user} = router.params;
    console.log('router:',router);
    
    if (loading) return <Loading/>;
    if (error) return <AlertError error={error}/>;
    console.log('----------------------------------------------------------------');

    return (
        <CommitView
            repo={repo}
            prefix={(prefix) ? prefix : ""}
            commitId={commitId}
            basedhash={basedhash}
            onNavigate={(entry) => {
                return {
                    pathname: '/repositories/:user/:repoId/commits/:commitId',
                    params: {repoId: repo.name, commitId: commitId,user},
                    query: {
                        prefix: entry.path,
                        ref:ref
                    }
                }
            }}
        />
    )
}

const RepositoryCommitPage = () => {
    return (
        <RepositoryPageLayout activePage={'commits'}>
            <CommitContainer/>
        </RepositoryPageLayout>
    )
}

export default RepositoryCommitPage;
