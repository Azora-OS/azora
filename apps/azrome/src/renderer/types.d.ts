import React from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            webview: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
                src?: string;
                autosize?: string;
                nodeintegration?: string;
                plugins?: string;
                preload?: string;
                httpreferrer?: string;
                useragent?: string;
                disablewebsecurity?: string;
                partition?: string;
                allowpopups?: string;
                webpreferences?: string;
                enableblinkfeatures?: string;
                disableblinkfeatures?: string;
            }, HTMLElement>;
        }
    }
}
