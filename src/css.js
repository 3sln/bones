export function css(strings, ...values) {
    const cssText = strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(cssText);
    return sheet;
}