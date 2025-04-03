import { type KeypressEvent, isDownKey, isUpKey, type Theme, useKeypress, useState, isEnterKey } from "@inquirer/core";
import { createPrompt, usePrefix, makeTheme } from "@inquirer/core";
import ansiEscapes from "ansi-escapes";

type InquirerToggleConfig = {
  message: string;
  default?: boolean;
  theme?: {
    active?: string;
    inactive?: string;
    prefix?: Theme["prefix"];
    style?: {
      message?: Theme["style"]["message"];
      answer?: Theme["style"]["answer"];
      highlight?: Theme["style"]["highlight"];
    }
  };
};

function isLeftKey(
  key: KeypressEvent,
): boolean {
  return key.name === "left";
}

function isRightKey(
  key: KeypressEvent,
): boolean {
  return key.name === "right";
}

export default createPrompt<boolean, InquirerToggleConfig>(
  (config, done) => {
    const theme = makeTheme({ active: "yes", inactive: "no" }, config.theme);
    const prefix = usePrefix({ theme });
    const [value, setValue] = useState(config.default ?? false);
    const [isDone, setIsDone] = useState(false);

    useKeypress((key) => {
      if (isEnterKey(key)) {
        setIsDone(true);
        done(value);
      } else if (isLeftKey(key) || isRightKey(key) || isUpKey(key) || isDownKey(key)) {
        setValue(!value);
      }
    });
    const message = theme.style.message(config.message, prefix);

    if (isDone) {
      return `${prefix} ${message} ${theme.style.answer(value ? theme.active : theme.inactive)}`;
    }

    const activeMessage = value ? theme.style.highlight(theme.active) : theme.active;
    const inactiveMessage = value ? theme.inactive : theme.style.highlight(theme.inactive);
    return `${prefix} ${message} ${inactiveMessage} / ${activeMessage}${ansiEscapes.cursorHide}`;
  }
);