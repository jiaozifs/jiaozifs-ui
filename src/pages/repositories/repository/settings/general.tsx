import React, {useContext, useEffect, useRef, useState} from "react";

import {useRefs} from "../../../../lib/hooks/repo";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import {TrashIcon} from "@primer/octicons-react";
import Col from "react-bootstrap/Col";
import {AlertError, Loading} from "../../../../lib/components/controls";
import Modal from "react-bootstrap/Modal";
import {cache} from "../../../../lib/api";
import {useRouter} from "../../../../lib/hooks/router";
import {SettingsLayout} from "./layout";
import {RepositoryPageLayout} from "../../../../lib/components/repository/layout";
import { repos } from "../../../../lib/api/interface/index";
import { ActivepageContext } from "../../../../lib/hooks/conf";

const DeleteRepositoryModal = ({repo, show, onSubmit, onCancel}) => {
    const [isDisabled, setIsDisabled] = useState(true);
    const repoNameField = useRef(null);
    const isclean = useRef()
    

    const compareRepoName = () => {
        setIsDisabled(repoNameField.current.value !== repo.name);
    };

    return (
        <Modal show={show} onHide={() => {
            setIsDisabled(true);
            onCancel();
        }} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Delete Repository</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you wish to delete repository <strong>{repo.name}</strong>? <br />
                This action cannot be undone. This will delete the following: <br /> <br />

                <ul>
                    <li>All commits</li>
                    <li>All branches</li>
                    <li>All tags</li>
                    <li>All repository configuration</li>
                </ul>

                Data in the underlying object store will not be deleted by this action. <br /> <br />

                Please type <strong>{repo.name}</strong> to confirm: <br />
                <Form.Control className="mt-2" placeholder="Enter repository name to confirm" type="text" autoFocus ref={repoNameField} onChange={compareRepoName}/>
                <input type="checkbox" ref={isclean}/>Do you want to clean data?
            </Modal.Body>
            <Modal.Footer>
                <Button disabled={isDisabled} variant="danger" onClick={()=>{onSubmit(isclean.current && isclean.current.checked)}}>I understand the consequences, delete this repository</Button>
            </Modal.Footer>
        </Modal>
    );
};

const SettingsContainer = () => {
    const router = useRouter();
    const { repo,reference, loading, error} = useRefs();
    const [showingDeleteModal, setShowDeleteModal] = useState(false);
    const [ deletionError, setDeletionError ] = useState(null);
    const user = cache.get('user')
    const {setPage,setRefresh,refresh} = useContext(ActivepageContext)

    useEffect(()=>{
        setPage('settings')
    },[])
    if (loading) return <Loading/>;
    if (error) return <AlertError error={error}/>;
    if (deletionError) return <AlertError error={deletionError}/>;

    return (
        <div className="mt-2 mb-5">

            <div className="section-title">
                <h4>General</h4>
            </div>

            <Container className="General-List">
                <Row>
                    <Form.Label column md={{span:3}} className="mb-3">
                        Repository name
                    </Form.Label>
                    <Col md={{span:4}}>
                        <Form.Control readOnly value={repo.name} type="text"/>
                    </Col>
                </Row>
                <Row>
                    <Form.Label column md={{span:3}} className="mb-3">
                        Storage namespace
                    </Form.Label>
                    <Col md={{span:4}}>
                        <Form.Control readOnly value={repo.storage_namespace} type="text"/>
                    </Col>
                </Row>
                <Row>
                    <Form.Label column md={{span:3}} className="mb-3">
                        Default branch
                    </Form.Label>
                    <Col md={{span:4}}>
                        <Form.Control readOnly value={repo.head} type="text"/>
                    </Col>
                </Row>
            </Container>

            <Button variant="danger" className="mt-3" onClick={() => setShowDeleteModal(!showingDeleteModal)}>
                <TrashIcon/> Delete Repository
            </Button>

            <DeleteRepositoryModal
                repo={repo}
                onCancel={() => { setShowDeleteModal(false) }}
                onSubmit={(isclean:boolean) => {
                    repos.deleteRepository(user,repo.name, isclean?{is_clean_data:isclean} : '').then(() => {
                        return router.push('/repositories')
                    }).catch(err => {
                        setDeletionError(err)
                        setShowDeleteModal(true)
                    })
                    setRefresh(!refresh)
                }
            }
                show={showingDeleteModal}/>
        </div>
    );
};


const RepositoryGeneralSettingsPage = () => {
   
    return (
        <RepositoryPageLayout activePage={'settings'}>
            <SettingsLayout activeTab={"general"}>
                <SettingsContainer/>
            </SettingsLayout>
        </RepositoryPageLayout>
    )
}


export default RepositoryGeneralSettingsPage;
