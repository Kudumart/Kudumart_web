export const renderDraftContent = (rawContent) => {
    const content = JSON.parse(rawContent);

    if (content && content.blocks.length > 0) {
        return content?.blocks.map(block => {
            let text = block.text;

            // Apply inline styles (e.g., Bold, Italic)
            if (block.inlineStyleRanges.length > 0) {
                block.inlineStyleRanges.forEach(range => {
                    const { offset, length, style } = range;
                    const before = text.slice(0, offset);
                    const styledText = text.slice(offset, offset + length);
                    const after = text.slice(offset + length);

                    switch (style) {
                        case "BOLD":
                            text = `${before}<strong>${styledText}</strong>${after}`;
                            break;
                        case "ITALIC":
                            text = `${before}<em>${styledText}</em>${after}`;
                            break;
                        case "UNDERLINE":
                            text = `${before}<u>${styledText}</u>${after}`;
                            break;
                        case "STRIKETHROUGH":
                            text = `${before}<s>${styledText}</s>${after}`;
                            break;
                        default:
                            break;
                    }
                });
            }

            // Wrap based on block type
            switch (block.type) {
                case "header-one":
                    return `<h1>${text}</h1>`;
                case "header-two":
                    return `<h2>${text}</h2>`;
                case "blockquote":
                    return `<blockquote>${text}</blockquote>`;
                case "unordered-list-item":
                    return `<li>${text}</li>`;
                case "ordered-list-item":
                    return `<li>${text}</li>`;
                default:
                    return `<p>${text}</p>`;
            }
        }).join(""); // Join all formatted blocks into a single string
    }
    else {
        return null;
    }
}
