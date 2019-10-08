import * as fs from 'fs';
import * as cheerio from 'cheerio';

export class TemplateReader {

    readonly pathToTemplate: string;
    readonly templateFile: string = 'template';
    private templateTree = [
        {
            search: '[sc-forms]',
            key: 'sc-forms',
            subs: [
                {
                    search: '[sc-repeat="form"]',
                    key: 'sc-repeat',
                    subs: [
                        {
                            search: '[sc-repeat="inputMocks"]',
                            key: 'sc-repeat',
                            subs: [
                                {
                                    search: '[sc-repeat="input"]',
                                    key: 'sc-repeat',
                                    subs: []
                                },
                                {
                                    search: '[sc-repeat="select"]',
                                    key: 'sc-repeat',
                                    subs: [
                                        {
                                            search: '[sc-repeat="value"]',
                                            key: 'sc-repeat',
                                            subs: []
                                        }
                                    ]
                                },
                                {
                                    search: '[sc-repeat="option"]',
                                    key: 'sc-repeat',
                                    subs: [
                                        {
                                            search: '[sc-repeat="value"]',
                                            key: 'sc-repeat',
                                            subs: []
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            search: '[sc-links]',
            key: 'sc-links',
            subs: [
                {
                    search: '[sc-repeat="link"]',
                    key: 'sc-repeat',
                    subs: []
                }
            ]
        }
    ];
    readonly props = {};
    readonly $: any;

    constructor(pathToTemplate: string) {
        this.pathToTemplate = pathToTemplate;
        if ( !fs.existsSync(this.pathToTemplate + this.templateFile) ) {
            this.templateFile = 'template.example';
        }
        if ( fs.existsSync(this.pathToTemplate + this.templateFile) ) {
            const contents = fs.readFileSync(this.pathToTemplate + this.templateFile);
            this.$ = cheerio.load(contents);
            const $template = this.$('template').contents();
            const templateWrapper = this.setContentMarkers(this.$('template').html(), $template);

            this.props = this.makeProps($template, 'template', templateWrapper, this.templateTree);
        }
    }

    getProps() {
        return this.props;
    }

    private setContentMarkers(templateWrapper: string, $template: any): string {
        if ( templateWrapper.indexOf('<!-- inner content start -->') === -1 && templateWrapper.indexOf('<!-- inner content end -->') === -1 ) {
            let innerContainer = $template.find('[sc-content]');
            if ( innerContainer.length ) {
                const containerStartingWrapper = this.$.html(innerContainer[0]);
                innerContainer = this.$(containerStartingWrapper);
                innerContainer.html('<!-- inner content start -->' + innerContainer.html() + '<!-- inner content end -->').removeAttr('sc-content');
                const containerEndingWrapper = this.$.html(innerContainer);

                templateWrapper = templateWrapper.replace(containerStartingWrapper, containerEndingWrapper);
            }
        }
        return templateWrapper;
    }

    private makeProps($elem: any, type: string, wrapper: string, treeSubs: any, typeValue: string = '') {
        const items: any[] = [];
        const searches: string[] = treeSubs.map((sub: any) => sub.search);

        // populate items and replace items found in wrapper HTML with placeholder
        treeSubs.forEach((sub: any) => {
            $elem.find(sub.search).each((_: number, match: any) => {
                const subWrapper = this.$.html(match);
                const subType = sub.key.replace('sc-', '');
                const subValue = match.attribs[sub.key];
                const parentProp = this.$(match).parent().closest('[sc-links],[sc-forms],[sc-repeat]');

                // only strip the match from the wrapper HTML if it's not nested within a parent search match
                if ( this.$(match).parents(searches.join(',')).length === 0 ) {
                    wrapper = wrapper.replace(subWrapper, `{{ ${subType}-${subValue} }}`);
                }

                if (
                    ['link', 'inputMocks'].indexOf(subValue) === -1
                    || (
                        parentProp.attr('sc-forms') === $elem.attr('sc-forms')
                        && parentProp.attr('sc-links') === $elem.attr('sc-links')
                        && parentProp.attr('sc-repeat') === $elem.attr('sc-repeat')
                )) {
                    items.push(
                        this.makeProps(this.$(subWrapper), subType, subWrapper, sub.subs, subValue)
                    );
                }
            });
        });

        // strip template HTML of any nested links or forms and replace with placeholder
        ['links', 'forms'].forEach(type => {
            this.$(wrapper).find(`[sc-${type}]`).each((_: number, elem2: any) => {
                let typeName = elem2.attribs[`sc-${type}`];
                let typeContents = this.$.html(elem2);
                wrapper = wrapper.replace(typeContents, `{{ ${type}-${typeName} }}`);
            });
        });

        return {
            type: type,
            value: typeValue,
            wrapper: wrapper
                .replace(` sc-${type}="${typeValue}"`, '')
                .replace('sc-injectable', '{{ attributes }}'),
            items: items
        };
    };
}
