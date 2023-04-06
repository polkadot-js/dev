// Copyright 2017-2023 @polkadot/dev-test authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { JSDOM } from 'jsdom';

/**
 * Export a very basic JSDom environment - this is just enough so we have
 * @testing-environment/react tests passing in this repo
 *
 * FIXME: This approach is actually _explicitly_ discouraged by JSDOM - when
 * using window you should run the tests inside that context, instead of just
 * blindly relying on the globals as we do here
 */
export function browser () {
  const { window } = new JSDOM('', { url: 'http://localhost' });

  return {
    // All HTML Elements that are defined on the JSDOM window object.
    // (we copied as-is from the types definition). We cannot get this
    // via Object.keys(window).filter(...) so we have to specify explicitly
    HTMLAnchorElement: window.HTMLAnchorElement,
    HTMLAreaElement: window.HTMLAreaElement,
    HTMLAudioElement: window.HTMLAudioElement,
    HTMLBRElement: window.HTMLBRElement,
    HTMLBaseElement: window.HTMLBaseElement,
    HTMLBodyElement: window.HTMLBodyElement,
    HTMLButtonElement: window.HTMLButtonElement,
    HTMLCanvasElement: window.HTMLCanvasElement,
    HTMLDListElement: window.HTMLDListElement,
    HTMLDataElement: window.HTMLDataElement,
    HTMLDataListElement: window.HTMLDataListElement,
    HTMLDetailsElement: window.HTMLDetailsElement,
    HTMLDialogElement: window.HTMLDialogElement,
    HTMLDirectoryElement: window.HTMLDirectoryElement,
    HTMLDivElement: window.HTMLDivElement,
    HTMLElement: window.HTMLElement,
    HTMLEmbedElement: window.HTMLEmbedElement,
    HTMLFieldSetElement: window.HTMLFieldSetElement,
    HTMLFontElement: window.HTMLFontElement,
    HTMLFormElement: window.HTMLFormElement,
    HTMLFrameElement: window.HTMLFrameElement,
    HTMLFrameSetElement: window.HTMLFrameSetElement,
    HTMLHRElement: window.HTMLHRElement,
    HTMLHeadElement: window.HTMLHeadElement,
    HTMLHeadingElement: window.HTMLHeadingElement,
    HTMLHtmlElement: window.HTMLHtmlElement,
    HTMLIFrameElement: window.HTMLIFrameElement,
    HTMLImageElement: window.HTMLImageElement,
    HTMLInputElement: window.HTMLInputElement,
    HTMLLIElement: window.HTMLLIElement,
    HTMLLabelElement: window.HTMLLabelElement,
    HTMLLegendElement: window.HTMLLegendElement,
    HTMLLinkElement: window.HTMLLinkElement,
    HTMLMapElement: window.HTMLMapElement,
    HTMLMarqueeElement: window.HTMLMarqueeElement,
    HTMLMediaElement: window.HTMLMediaElement,
    HTMLMenuElement: window.HTMLMenuElement,
    HTMLMetaElement: window.HTMLMetaElement,
    HTMLMeterElement: window.HTMLMeterElement,
    HTMLModElement: window.HTMLModElement,
    HTMLOListElement: window.HTMLOListElement,
    HTMLObjectElement: window.HTMLObjectElement,
    HTMLOptGroupElement: window.HTMLOptGroupElement,
    HTMLOptionElement: window.HTMLOptionElement,
    HTMLOutputElement: window.HTMLOutputElement,
    HTMLParagraphElement: window.HTMLParagraphElement,
    HTMLParamElement: window.HTMLParamElement,
    HTMLPictureElement: window.HTMLPictureElement,
    HTMLPreElement: window.HTMLPreElement,
    HTMLProgressElement: window.HTMLProgressElement,
    HTMLQuoteElement: window.HTMLQuoteElement,
    HTMLScriptElement: window.HTMLScriptElement,
    HTMLSelectElement: window.HTMLSelectElement,
    HTMLSlotElement: window.HTMLSlotElement,
    HTMLSourceElement: window.HTMLSourceElement,
    HTMLSpanElement: window.HTMLSpanElement,
    HTMLStyleElement: window.HTMLStyleElement,
    HTMLTableCaptionElement: window.HTMLTableCaptionElement,
    HTMLTableCellElement: window.HTMLTableCellElement,
    HTMLTableColElement: window.HTMLTableColElement,
    HTMLTableElement: window.HTMLTableElement,
    HTMLTableRowElement: window.HTMLTableRowElement,
    HTMLTableSectionElement: window.HTMLTableSectionElement,
    HTMLTemplateElement: window.HTMLTemplateElement,
    HTMLTextAreaElement: window.HTMLTextAreaElement,
    HTMLTimeElement: window.HTMLTimeElement,
    HTMLTitleElement: window.HTMLTitleElement,
    HTMLTrackElement: window.HTMLTrackElement,
    HTMLUListElement: window.HTMLUListElement,
    HTMLUnknownElement: window.HTMLUnknownElement,
    HTMLVideoElement: window.HTMLVideoElement,
    // normal service resumes, the base top-level names
    crypto: window.crypto,
    document: window.document,
    localStorage: window.localStorage,
    navigator: window.navigator,
    // window...
    window
  };
}
