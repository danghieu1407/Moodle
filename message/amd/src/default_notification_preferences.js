// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Controls the default settings for the list of notification types on the
 * notifications admin page
 *
 * @module     core_message/default_notification_preferences
 * @class      default_notification_preferences
 * @copyright  2021 Moodle
 * @author     Pau Ferrer Ocaña <pau@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import * as Ajax from 'core/ajax';
import Notification from 'core/notification';
import {add as addToast} from 'core/toast';

const selectors = {
    provider: '.defaultmessageoutputs .provider_enabled',
    lockSetting: '.locked_message_setting',
    enabledSetting: '.enabled_message_setting',
    allSettings: '.locked_message_setting, .enabled_message_setting'
};

/**
 * Register event listeners for the default_notification_preferences page.
 */
const registerEventListeners = () => {

    /**
     * Update the dimmed status of the "enabled" toggle on the notification setting.
     *
     * @param {HTMLElement} lockedElement Element that receives the event.
     */
    const toggleLockSetting = (lockedElement) => {
        const isEnabled = lockedElement.checked || false;
        const enabledId = lockedElement.id.replace('_locked[', '_enabled[');

        const enabledElement = document.getElementById(enabledId).closest('div.form-check');
        enabledElement.classList.toggle('dimmed_text', isEnabled);
    };

    /**
     * Enable/Disable all settings of the provider.
     *
     * @param {HTMLElement} providerEnabledElement Element that receives the event.
     */
    const toggleEnableProviderSettings = (providerEnabledElement) => {
        const isEnabled = providerEnabledElement.checked || false;
        const parentRow = providerEnabledElement.closest('tr');

        const elements = parentRow.querySelectorAll(selectors.allSettings);
        elements.forEach((element) => {
            element.toggleAttribute('disabled', !isEnabled);
        });
    };

    /**
     * AJAX call to update the default notification element status on the server.
     *
     * @param {Boolean} isEnabled
     * @param {string} preference
     */
    const setDefaultNotification = (isEnabled, preference) => {
        // AJAX call to update the provider's enable status on the server.
        Ajax.call([{
            methodname: 'core_message_set_default_notification',
            args: {
                preference: preference,
                state: isEnabled ? 1 : 0
            }
        }])[0]
        .then((data) => addToast(data.successmessage))
        .catch(Notification.exception);
    };

    const container = document.querySelector('.preferences-container');

    container.querySelectorAll(selectors.provider).forEach((providerEnabledElement) => {
        // Set the initial statuses.
        if (!providerEnabledElement.checked) {
            toggleEnableProviderSettings(providerEnabledElement);
        }

        providerEnabledElement.addEventListener('change', (e) => {
            toggleEnableProviderSettings(e.target);

            setDefaultNotification(
                e.target.checked,
                providerEnabledElement.parentElement.parentElement.dataset.preference);
        });
    });

    container.querySelectorAll(selectors.lockSetting).forEach((lockedElement) => {
        // Set the initial statuses.
        if (lockedElement.checked) {
            toggleLockSetting(lockedElement);
        }

        lockedElement.addEventListener('change', (e) => {
            toggleLockSetting(e.target);

            setDefaultNotification(
                e.target.checked,
                lockedElement.parentElement.parentElement.dataset.preference);
        });
    });

    container.querySelectorAll(selectors.enabledSetting).forEach((enabledElement) => {
        enabledElement.addEventListener('change', (e) => {
            setDefaultNotification(
                e.target.checked,
                enabledElement.parentElement.parentElement.dataset.preference);
        });
    });
};

/**
 * Initialize the page.
 */
const init = () => {
    registerEventListeners();
};

export default {
    init: init,
};
