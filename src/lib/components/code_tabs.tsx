import {Alert, Box, Snackbar, SnackbarCloseReason} from "@mui/material";
import {ClipboardButton, copyTextToClipboard} from "./controls";
import {FaRegCopy} from "react-icons/fa";
import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import {a11yLight} from "react-syntax-highlighter/src/styles/hljs";
import { CodeTabPanelProps } from "./interface/comp_interface";

export const CodeTabPanel:React.FC<CodeTabPanelProps> = ({children, isSelected, language=null, index, ...other}) => {
    const [openSnackbar, setOpenSnackbar] = React.useState(false);

    const copyCode = async (text: string[] | string) => {
        await copyTextToClipboard(text, ()=> setOpenSnackbar(true));
    }

    const handleCloseSnackbar = (_event:React.SyntheticEvent<any> | Event, reason?:SnackbarCloseReason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    return (
        <div
            role="code-tabpanel"
            hidden={!isSelected}
            id={`code-tabpanel-${index}`}
            aria-labelledby={`code-tabpanel-${index}`}
            {...other}
        >
            {isSelected && (
                <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', py: 1, cursor: 'pointer'}}
                     className={'code-container text-secondary'}
                     onClick={() => copyCode(children)}>
                    <Box sx={{ml: 2}}>
                    <SyntaxHighlighter language={language || undefined} style={a11yLight} wrapLongLines customStyle={{margin: 0, padding: 0, backgroundColor: 'inherit'}}>
                    {children || ''}
                    </SyntaxHighlighter>
                    </Box>
                    <Box sx={{mr: 2}}>
                        <ClipboardButton icon={<FaRegCopy size={16}/>} variant="link" tooltip="Copy to clipboard"
                                         text={children} size={'sm'}/>
                    </Box>
                </Box>
            )}
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="info" sx={{ width: '100%' }}>
                    Copied configuration
                </Alert>
            </Snackbar>
        </div>
    );
}
