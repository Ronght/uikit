import { Class, Modal } from '../mixin/index';
import { $, assign, isString, promise } from '../util/index';

export default function (UIkit) {

    UIkit.component('modal', {

        mixins: [Modal],

        defaults: {
            clsPage: 'uk-modal-page',
            clsPanel: 'uk-modal-dialog',
            selClose: '.uk-modal-close, .uk-modal-close-default, .uk-modal-close-outside, .uk-modal-close-full'
        },

        events: [

            {
                name: 'beforeshow',

                self: true,

                handler() {

                    if (this.panel.hasClass('uk-margin-auto-vertical')) {
                        this.$el.addClass('uk-flex').height();
                    } else {
                        this.$el.css('display', 'block').height();
                    }

                }
            },

            {
                name: 'hidden',

                self: true,

                handler() {

                    this.$el.css('display', '').removeClass('uk-flex');

                }
            }

        ]

    });

    UIkit.component('overflow-auto', {

        mixins: [Class],

        computed: {

            modal() {
                return this.$el.closest('.uk-modal');
            },

            panel() {
                return this.$el.closest('.uk-modal-dialog');
            }

        },

        connected() {
            this.$el.css('min-height', 150);
        },

        update: {

            write() {
                var current = this.$el.css('max-height');

                this.$el.css('max-height', 150).css('max-height', Math.max(150, 150 + this.modal.height() - this.panel.outerHeight(true)));
                if (current !== this.$el.css('max-height')) {
                    this.$el.trigger('resize');
                }
            },

            events: ['load', 'resize']

        }

    });

    UIkit.modal.dialog = function (content, options) {

        var dialog = UIkit.modal(`
            <div class="uk-modal">
                <div class="uk-modal-dialog">${content}</div>
             </div>
        `, options);

        dialog.$el.on('hidden', e => {
            if (e.target === e.currentTarget) {
                dialog.$destroy(true);
            }
        });
        dialog.show();

        return dialog;
    };

    UIkit.modal.alert = function (message, options) {

        options = assign({bgClose: false, escClose: false, labels: UIkit.modal.labels}, options);

        return promise(
            resolve => UIkit.modal.dialog(`
                <div class="uk-modal-body">${isString(message) ? message : $(message).html()}</div>
                <div class="uk-modal-footer uk-text-right">
                    <button class="uk-button uk-button-primary uk-modal-close" autofocus>${options.labels.ok}</button>
                </div>
            `, options).$el.on('hide', resolve)
        );
    };

    UIkit.modal.confirm = function (message, options) {

        options = assign({bgClose: false, escClose: false, labels: UIkit.modal.labels}, options);

        return promise(
            (resolve, reject) => UIkit.modal.dialog(`
                <div class="uk-modal-body">${isString(message) ? message : $(message).html()}</div>
                <div class="uk-modal-footer uk-text-right">
                    <button class="uk-button uk-button-default uk-modal-close">${options.labels.cancel}</button>
                    <button class="uk-button uk-button-primary uk-modal-close" autofocus>${options.labels.ok}</button>
                </div>
            `, options).$el.on('click', '.uk-modal-footer button', e => $(e.target).index() === 0 ? reject() : resolve())
        );
    };

    UIkit.modal.prompt = function (message, value, options) {

        options = assign({bgClose: false, escClose: false, labels: UIkit.modal.labels}, options);

        return promise(resolve => {

            var resolved = false,
                prompt = UIkit.modal.dialog(`
                    <form class="uk-form-stacked">
                        <div class="uk-modal-body">
                            <label>${isString(message) ? message : $(message).html()}</label>
                            <input class="uk-input" type="text" autofocus>
                        </div>
                        <div class="uk-modal-footer uk-text-right">
                            <button class="uk-button uk-button-default uk-modal-close" type="button">${options.labels.cancel}</button>
                            <button class="uk-button uk-button-primary" type="submit">${options.labels.ok}</button>
                        </div>
                    </form>
                `, options),
                input = prompt.$el.find('input').val(value);

            prompt.$el
                .on('submit', 'form', e => {
                    e.preventDefault();
                    resolve(input.val());
                    resolved = true;
                    prompt.hide()
                })
                .on('hide', () => {
                    if (!resolved) {
                        resolve(null);
                    }
                });

        });
    };

    UIkit.modal.labels = {
        ok: 'Ok',
        cancel: 'Cancel'
    }

}
