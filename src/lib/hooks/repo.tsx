import React, {useContext, useState, createContext, useEffect} from "react";

import {repositories, branches, commits, NotFoundError, tags, BadRequestError, cache} from "../api";
import {useRouter} from "./router";
import {RefTypeBranch, RefTypeCommit, RefTypeTag} from "../../constants";


export const resolveRef = async (repoId:string, refId:string) => {
    // try branch
    try {
        const branch = await branches.getBranch(repoId, refId);
        
        return {...branch,type: RefTypeBranch};
    } catch(error) {
        if (!(error instanceof NotFoundError) && !(error instanceof BadRequestError)) {
            throw error;
        }
    }
    // // try tag
    // try {
    //     const tag = await tags.get(repoId, refId);
    //     return {id: tag.id, type: RefTypeTag};
    // } catch(error) {
    //     if (!(error instanceof NotFoundError) && !(error instanceof BadRequestError)) {
    //         throw error;
    //     }
    // }
    // try commit
    try {
        const commit = await commits.getCommitsInRepository(repoId, refId);
        return {id: commit.id,  type: RefTypeCommit};
    } catch(error) {
        if (!(error instanceof NotFoundError)) {
            throw error;
        }
    }

    throw new NotFoundError('ref not found');
};


const RefContext =  createContext(null);

export const useRefs = () => {
    const [ refs ] = useContext(RefContext);
    return refs;
}

export const useRefsWithRefresh = () => {
    return useContext(RefContext);
};

const refContextInitialState = {
    loading: true,
    error: null,
    repo: null,
    reference: null,
    compare: null
};

export const RefContextProvider = ({ children }) => {
    const router = useRouter();
    const { repoId } = router.params;
    const {ref, compare} = router.query;
    const [refState, setRefState] = useState(refContextInitialState);
    console.log('repoId:',repoId,'ref:',ref);
    
    useEffect(() => {
        const fetch = async () => {
            setRefState(refContextInitialState);
            if (!repoId) return;
            try {
                const repo = await repositories.getRepository(repoId);
                const reference = await resolveRef(repoId, ref?ref:'main');
                const comparedRef = await resolveRef(repoId, ref?ref:'main');
                setRefState({...refContextInitialState, loading: false, repo, reference, compare: comparedRef});
            } catch (err) {
                setRefState({...refContextInitialState, loading: false, error: err});
            }
        };
        fetch();
    }, [repoId, ref, compare]);

    return (
        <RefContext.Provider value={[refState, fetch]}>
            {children}
        </RefContext.Provider>
    );
};