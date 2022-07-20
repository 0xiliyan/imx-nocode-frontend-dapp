import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
    body {
        margin: 0;
        padding: 0;
        color: ${props => props.color};
        background: ${props => props.background};
        font-weight: 700;
        font-family: 'Fredoka', sans-serif;
    }
    
    input, select, button, textarea {
        font-family: 'Fredoka', sans-serif;
    }
`;

export default GlobalStyles;