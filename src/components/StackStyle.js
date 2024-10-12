import { styled, Stack, alpha } from '@mui/system';

const StackStyle = styled(Stack)(({ theme, ...props }) => ({
    backdropFilter: 'blur(2px)',
    WebkitBackdropFilter: 'blur(2px)',
    borderRadius: '13px',
    //border: '1px solid #ccc',// #323546
    padding: '0em 0.5em 1.5em 0.5em',
    backgroundColor: alpha("#919EAB", 0.03),
    ...props.sx,
}));

export default StackStyle;