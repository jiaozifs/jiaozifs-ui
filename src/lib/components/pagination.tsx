import React from "react";

import Button from "react-bootstrap/Button";
import { PaginatorProps } from "./interface/comp_interface";


export const Paginator:React.FC<PaginatorProps> = ({ onPaginate, nextPage = null, after = "" }) => {
    if (after === "" && nextPage === null) return <></>;
    return (
        <div className="paginator mt-2 mb-2">

            <Button variant="secondary" disabled={(after === "")} onClick={() => onPaginate("")}>Back to Start</Button>
            {' '}

            <Button variant="primary" disabled={(nextPage === null)} onClick={() => onPaginate(nextPage)}>Next Page</Button>

        </div>
    );
};