/**
 * Copyright (C) 2005-2016 Alfresco Software Limited.
 *
 * This file is part of Alfresco
 *
 * Alfresco is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Alfresco is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @author Dave Draper
 * @since 1.0.NEXT
 */
define(["module",
        "alfresco/defineSuite",
        "intern/chai!assert",
        "alfresco/TestCommon",
        "intern/dojo/node!leadfoot/keys"],
        function(module, defineSuite, assert, TestCommon, keys) {

   var buttonSelectors = TestCommon.getTestSelectors("alfresco/buttons/AlfButton");
   var DialogSelectors = TestCommon.getTestSelectors("alfresco/dialogs/AlfDialog");
   
   var selectors = {
      buttons: {
         singlePicker: {
            openDialog: TestCommon.getTestSelector(buttonSelectors, "button.label", ["SINGLE_ITEM_FILE_PICKER_SHOW_FILE_PICKER_DIALOG"]),
            confirmation: TestCommon.getTestSelector(buttonSelectors, "button.label", ["SINGLE_ITEM_FILE_PICKER_CONFIRMATION_BUTTON"])
         }
      },
      dialogs: {
         singlePicker: {
            displayed: TestCommon.getTestSelector(DialogSelectors, "visible.dialog", ["SINGLE_ITEM_FILE_PICKER_FILE_PICKER_DIALOG"]),
            hidden: TestCommon.getTestSelector(DialogSelectors, "hidden.dialog", ["SINGLE_ITEM_FILE_PICKER_FILE_PICKER_DIALOG"]),
         }
      }
   };

   defineSuite(module, {
      name: "File Picker Tests",
      testPage: "/FilePicker",

      "Open picker dialog": function() {
         return this.remote.findByCssSelector(selectors.buttons.singlePicker.openDialog)
            .click()
         .end()

         .findDisplayedByCssSelector(selectors.dialogs.singlePicker.displayed);
      },

      // This test checks that we are including the datatype query parameter in the search XHR request
      // that will ensure that only files are returned...
      "Search for file (check query parameter)": function() {
         return this.remote.findDisplayedByCssSelector("#SINGLE_ITEM_FILE_PICKER_SEARCH_FIELD .dijitInputContainer input")
            .clearValue()
            .type("search")
            .pressKeys(keys.RETURN)
         .end()

         .getLastXhr()
            .then(function(xhr) {
               assert.include(xhr.request.url, "query=%7B%22datatype%22%3A%22cm%3Acontent%22%7D");
            });
      },

      "Add file from search results": function() {
         return this.remote.findDisplayedByCssSelector("#SINGLE_ITEM_FILE_PICKER_SEARCH_ADD_ITEM_0")
            .click()
         .end()

         .findDisplayedByCssSelector(selectors.dialogs.singlePicker.displayed + " #SINGLE_ITEM_FILE_PICKER_SELECTED_FILES_NAME_ITEM_0");
      },

      // The default is single item selection, but this is double checking that you can't select the same item twice anyway...
      "Cannot select the same file twice": function() {
          return this.remote.findDisplayedByCssSelector("#SINGLE_ITEM_FILE_PICKER_SEARCH_ADD_ITEM_0")
            .click()
         .end()

         .findAllByCssSelector(selectors.dialogs.singlePicker.displayed + " #SINGLE_ITEM_FILE_PICKER_SELECTED_FILES_VIEW_ITEMS tr")
            .then(function(selectedFiles) {
               assert.lengthOf(selectedFiles, 1);
            });
      },

      "Cannot select two items when multipleItemSelection is false": function() {
         return this.remote.findDisplayedByCssSelector("#SINGLE_ITEM_FILE_PICKER_SEARCH_ADD_ITEM_1")
            .click()
         .end()

         .findAllByCssSelector(selectors.dialogs.singlePicker.displayed + " #SINGLE_ITEM_FILE_PICKER_SELECTED_FILES_VIEW_ITEMS tr")
            .then(function(selectedFiles) {
               assert.lengthOf(selectedFiles, 1);
            });
      },

      "Last selected item replaced original selected item": function() {
         return this.remote.findDisplayedByCssSelector("#SINGLE_ITEM_FILE_PICKER_SELECTED_FILES_NAME_ITEM_1")
            .getVisibleText()
            .then(function(selectedFileName) {
               assert.equal(selectedFileName, "test_readCompositeData.js");
            });
      },

      "Remove selected file (within dialog)": function() {
         return this.remote.findByCssSelector("#SINGLE_ITEM_FILE_PICKER_SELECTED_FILES_REMOVE_ITEM_1 .alfresco-renderers-PublishAction__image")
            .click()
         .end()

         .findAllByCssSelector(selectors.dialogs.singlePicker.displayed + " #SINGLE_ITEM_FILE_PICKER_SELECTED_FILES_VIEW_ITEMS tr")
            .then(function(selectedFiles) {
               assert.lengthOf(selectedFiles, 0);
            });
      },

      "Select recent sites tab": function() {
         return this.remote.findByCssSelector("#SINGLE_ITEM_FILE_PICKER_TABCONTAINER_TABCONTAINER_tablist_SINGLE_ITEM_FILE_PICKER_TABCONTAINER_SINGLE_ITEM_FILE_PICKER_RECENT_SITES_TAB")
            .clearXhrLog()
            .click()
         .end()

         .findDisplayedByCssSelector("#SINGLE_ITEM_FILE_PICKER_SELECT_RECENT_SITE")
         .end()

         .getLastXhr("aikau/proxy/alfresco/api/people/guest/sites/recent")

         .findDisplayedByCssSelector("#SINGLE_ITEM_FILE_PICKER_BROWSE_NAME_ITEM_0");
      },

      "Folder cannot be added": function() {
         return this.remote.findAllByCssSelector("#SINGLE_ITEM_FILE_PICKER_BROWSE_ADD_ITEM_0")
            .then(function(folderAdd) {
               assert.lengthOf(folderAdd, 0);
            });
      },

      "Add recent sites file": function() {
         return this.remote.findByCssSelector("#SINGLE_ITEM_FILE_PICKER_BROWSE_ADD_ITEM_4")
            .click()
         .end()

         .findDisplayedByCssSelector("#SINGLE_ITEM_FILE_PICKER_SELECTED_FILES_NAME_ITEM_4")
            .getVisibleText()
            .then(function(selectedFileName) {
               assert.equal(selectedFileName, "Aikau Development Demo.ogv");
            });
      },

      "Confirm file selection": function() {
         return this.remote.findByCssSelector(selectors.buttons.singlePicker.confirmation)
            .clearLog()
            .click()
         .end()

         .findByCssSelector(selectors.dialogs.singlePicker.hidden)
         .end()

         .getLastPublish("FORM_SCOPE__valueChangeOf_SINGLE_FILE")
            .then(function(payload) {
               assert.include(payload.value, "workspace://SpacesStore/89366ee4-824d-4d3a-859a-d81a25d9bff3");
            });
      }
   });
});