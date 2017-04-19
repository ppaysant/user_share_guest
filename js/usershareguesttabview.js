/**
 * ownCloud - User Share Guest
 *
 * @author Victor Bordage-Gorry <victor.bordage-gorry@globalis-ms.com>
 * @copyright 2017 CNRS DSI
 * @license This file is licensed under the Affero General Public License version 3 or later. See the COPYING file.
 */

(function(OC, OCA) {
    // will use Handlebars to create the final html (see template and render functions)
    // Handlebars : http://handlebarsjs.com/
/*
    if (!OC.Share) {
        OC.Share = {};
    }*/

    var TEMPLATE =
        '<div id="guest" class="guestShare">' +
        '<span class="icon-loading-small hidden"></span>' +
        '<input type="checkbox" class="checkbox" name="guestCheckbox" id="guestCheckbox" value="1" />' +
        '<label for="guestCheckbox">' + t('user_share_guest', 'Guest link') + '</label>' +
        '<form id="guestForm">' +
        '<label for="guestInput">' + t('user_share_guest', 'Guest mail') + '</label>' +
        '<input type="text" name="guestInput" id="guestInput"/>' +
        '<span class="icon-loading-small hidden" id="guestLoad"></span>' +
        '<input type="submit" name="guestSubmit" id="guestSubmit" value="' + t('user_share_guest', 'Guest submit') + '"/>' +
        '</form>' +
        '<ul id="guestList">' +
        '</ul>' +
        '</div>';

    var SHARE_TEMPLATE =
        'Partage';

    /**
     * @member of OCA.UserFilesRestore
     */
    var UserShareGuestTabView = OCA.Files.DetailTabView.extend({
        id: 'UserShareGuest',
        className: 'tab userShareGuestTabView',
        id: 'UserShareGuest',

        /** @type {OC.Share.ShareConfigModel} **/
        configModel: undefined,

        /** @type {Function} **/
        _template: undefined,

        /** @type {boolean} **/
        showLink: true,

        // declare to which events you want to react and how
        events: {
            'change #guestCheckbox': '_onChangeShareGuestVisibility',
            'click #guestSubmit': '_onClickShareGuest'
        },

        // initialize the view
        initialize: function(options) {
            view = this;
            _.bindAll(
                this,
                '_onChangeShareGuestVisibility'
            );

            // ajout des événements
        },

        // gives the tab's label
        getLabel: function() {
            return t('user_share_guest', 'Share to a guest');
        },

        createShareGuest: function(uid) {

            fileInfo = this.model.attributes;
            $.ajax({
                type: 'POST',
                url: OC.generateUrl('apps/user_share_guest/create'),
                dataType: 'json',
                data: {uid: uid, itemType: fileInfo.itemType, itemSource:fileInfo.itemSource},
                async: false,
                success: function(resp) {
                    $('#guestSubmit').show();
                    $('#guestLoad').addClass('hidden');
                    if (resp.status == 'error') {
                        OCdialogs.info(resp.data.msg, "bonjour", function() {
                        }, true);
                    }
                    var user = resp.data.user;
                    OC.Share.addShareWith(0, user.uid, user.uid, false, 31, false, false);
                    $('#guestInput').val('');
                }
            });
        },

        // functions on event
        
        _onClickShareGuest: function(event) {
            event.preventDefault();
            var self = this;
            var uid = $('#guestInput').val();
            $.ajax({
                type: 'GET',
                url: OC.generateUrl('apps/user_share_guest/is_guest_creation'),
                dataType: 'json',
                data: {uid: uid},
                async: false,
                success: function(resp) {
                    if (resp.data.exist == false) {
                        OCdialogs
                        .confirm(
                            t('user_share_guest', '____________________________________________'),
                            t('user_share_guest', 'Share to a guest'),
                            function(ok) {
                                if (ok) {
                                    // on lance le partage
                                    self.createShareGuest(uid);
                                }
                            },
                            true)
                        .then(function() {
                            var contentDiv = $('div.oc-dialog-content p');

                            var msg = t('user_share_guest', 'Warning, you well took knowledge of the risks regarding the sharing of file to a guest account.');

                            contentDiv.html(msg);
                        });
                    } else {
                        $('#guestSubmit').hide();
                        $('#guestLoad').removeClass('hidden');

                        // ajout du partage
                        self.createShareGuest(uid);
                    }
                }
            });
            return false;
        },

        _onChangeShareGuestVisibility: function(e) {
            if (e.target.checked) {
                $('#guestForm').show('blind');
                $('#guestList').show('blind');
            } else {
                $('#guestForm').hide('blind');
                $('#guestList').hide('blind');
            }
        },

        // function generation template
        template: function () {
            if (!this._template) {
                this._template = Handlebars.compile(TEMPLATE);
            }
            return this._template;
        },


        render: function() {
            var template = this.template('base', TEMPLATE);
            console.log('render partie guest');
            this.$el.html(template());
            this.delegateEvents();
            return this;
        },
    });

    OCA.UserShareGuest.UserShareGuestTabView = UserShareGuestTabView;        
})(OC, OCA);
