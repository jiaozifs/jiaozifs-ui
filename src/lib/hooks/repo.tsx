import React, {useContext, useState, createContext, useEffect} from "react";

import { NotFoundError, BadRequestError, cache} from "../api";
import {useRouter} from "./router";
import {RefTypeBranch} from "../../constants";
import { repos } from "../api/interface";


export const resolveRef = async (user,repoId:string, refId:string) => {
    // try branch
    try {
        const branch = await repos.getBranch(user,repoId, {refName:refId});
        
        return {...branch.data,type: RefTypeBranch};
    } catch(error) {
        if (!(error instanceof NotFoundError) && !(error instanceof BadRequestError)) {
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
    const user = cache.get('user')
    useEffect(() => {
        const fetch = async () => {
            setRefState(refContextInitialState);
            if (!repoId) return;
            try {
                const repo = await repos.getRepository( user, repoId)
                const reference = await resolveRef(user,repoId, ref?ref:'main');
                const comparedRef = await resolveRef(user,repoId, ref?ref:'main');
                setRefState({...refContextInitialState, loading: false, repo: repo.data,reference, compare: comparedRef});
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