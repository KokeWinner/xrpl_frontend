import { XrplToDarkTheme } from './XrplToDarkTheme';
import { XrplToLightTheme } from './XrplToLightTheme';

const themeMap = {
    XrplToDarkTheme,
    XrplToLightTheme,
};

export function themeCreator(dark) {
    let theme;
    if (dark)
        theme = 'XrplToDarkTheme';
    else
        theme = 'XrplToLightTheme';
    return themeMap[theme];
}
