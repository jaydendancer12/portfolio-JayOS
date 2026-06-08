import { memo } from "react";
import styled from "styled-components";

const StyledDesktopOnly = styled.div`
  align-items: center;
  background: #1a1a1a;
  color: #ccc;
  display: flex;
  flex-direction: column;
  font-family: ${({ theme }) => theme.formats.systemFont};
  gap: 12px;
  height: 100%;
  justify-content: center;
  padding: 24px;
  text-align: center;
  width: 100%;

  svg {
    color: #555;
    height: 48px;
    width: 48px;
  }

  h2 {
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }

  p {
    color: #888;
    font-size: 13px;
    margin: 0;
  }
`;

const DesktopOnly: FC = () => (
  <StyledDesktopOnly>
    <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path
        d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <h2>Desktop Only</h2>
    <p>This game is only available on desktop.</p>
  </StyledDesktopOnly>
);

export default memo(DesktopOnly);
