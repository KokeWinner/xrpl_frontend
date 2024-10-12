import { m as motion } from "framer-motion";
import shouldForwardProp from "@styled-system/should-forward-prop";
import { styled } from "styled-components";
import { background, border, layout, position, space, color, typography } from "styled-system";
import CloseIcon from '@mui/icons-material/Close';
import { flexbox } from "styled-system";

const mobileFooterHeight = 73;

const Box = styled.div.withConfig({
    shouldForwardProp,
})`
    ${background}
    ${border}
    ${layout}
    ${position}
    ${space}
    ${color}
`;

const Flex = styled(Box)`
  display: flex;
  ${flexbox}
`;

export const MODAL_SWIPE_TO_CLOSE_VELOCITY = 300;

export const MotionBox = styled(motion.div)`
  ${background}
  ${border}
  ${layout}
  ${position}
  ${space}
`;

export const ModalHeader = styled(Flex)`
  align-items: center;
  background: transparent;
  border-bottom: 1px solid ${({ theme, headerBorderColor }) => headerBorderColor || theme.colors.cardBorder};
  display: flex;
  padding: 12px 24px;

  ${({ theme }) => theme.mediaQueries.md} {
    background: ${({ background }) => background || "transparent"};
  }
`;

export const ModalTitle = styled(Flex)`
  align-items: center;
  flex: 1;
`;

export const ModalBody = styled(Flex)`
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(90vh - ${mobileFooterHeight}px);
  ${({ theme }) => theme.mediaQueries.md} {
    display: flex;
    max-height: 90vh;
  }
`;

const IconButton = styled.button`
  padding: 2px;
  width: ${({ scale }) => (scale === "xs" ? "auto" : scale === "sm" ? "32px" : "48px")};
  position: relative;
  align-items: center;
  border: 0px;
  border-radius: 16px;
  cursor: pointer;
  display: inline-flex;
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  justify-content: center;
  letter-spacing: 0.03em;
  line-height: 1;
  opacity: 1;
  outline: 0px;
  transition: background-color 0.2s ease 0s, opacity 0.2s ease 0s;
  height: 48px;
  padding: 0px 24px;
  background-color: transparent;
  box-shadow: none;
`;

export const ModalCloseButton = ({
    onDismiss,
}) => {
    return (
        <IconButton
            variant="text"
            onClick={(e) => {
                e.stopPropagation();
                onDismiss?.();
            }}
            aria-label="Close the dialog"
        >
            <CloseIcon color="primary" />
        </IconButton>
    );
};

export const ModalBackButton = ({ onBack }) => {
    return (
        <IconButton variant="text" onClick={onBack} area-label="go back" mr="8px">
            {/* <ArrowBackIcon color="primary" /> */}
        </IconButton>
    );
};

export const ModalContainer = styled(MotionBox)`
  overflow: hidden;
  background: ${({ theme }) => theme.modal.background};
  box-shadow: 0px 20px 36px -8px rgba(14, 14, 44, 0.1), 0px 1px 1px rgba(0, 0, 0, 0.05);
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 12px 12px 0px 0px;
  width: 100%;
  max-height: calc(var(--vh, 1vh) * 100);
  z-index: ${({ theme }) => theme.zIndices.modal};
  position: absolute;
  bottom: 0;
  max-width: none !important;
  min-height: ${({ $minHeight }) => $minHeight};

  ${({ theme }) => theme.mediaQueries.md} {
    width: auto;
    position: auto;
    bottom: auto;
    border-radius: 12px;
    max-height: 100vh;
  }
`;

export const Heading = styled.span.withConfig({
    shouldForwardProp,
})`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  line-height: 1.5;
  font-size: 20px;
  ${({ textTransform }) => textTransform && `text-transform: ${textTransform};`}
  ${({ ellipsis }) =>
        ellipsis &&
        `white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;`}

  ${space}
  ${typography}
  ${layout}

  ${({ small }) => small && `font-size: 14px;`}
`;

export const Input = styled("input").withConfig({
    shouldForwardProp: (props) => !["scale", "isSuccess", "isWarning"].includes(props),
})`
    background-color: ${({ theme }) => theme.colors.input};
    border-radius: 16px;
    box-shadow: inset 0px 2px 2px -1px rgba(74,74,104,.1);
    color: ${({ theme }) => theme.colors.text};
    display: block;
    font-size: 16px;
    height: 48px;
    outline: 0;
    padding: 0 16px;
    width: 100%;
    border: 1px solid ${({ theme }) => theme.colors.inputSecondary};
  
    &::placeholder {
      color: ${({ theme }) => theme.colors.textSubtle};
    }
  
    &:disabled {
      background-color: ${({ theme }) => theme.colors.backgroundDisabled};
      box-shadow: none;
      color: ${({ theme }) => theme.colors.textDisabled};
      cursor: not-allowed;
    }
  
    &:focus:not(:disabled) {
      box-shadow: ${({ theme, isWarning, isSuccess }) => {
        if (isWarning) {
            return theme.shadows.warning;
        }

        if (isSuccess) {
            return theme.shadows.success;
        }
        return theme.shadows.focus;
    }};
    }
`;