/**
 * Ajax.org Code Editor (ACE)
 *
 * @copyright 2010, Ajax.org Services B.V.
 * @license LGPLv3 <http://www.gnu.org/licenses/lgpl-3.0.txt>
 * @author Fabian Jakobs <fabian AT ajax DOT org>
 */

require("../../../support/paths");

var dom     = require('jsdom/level2/html').dom.level2.html;
var browser = require('jsdom/browser/index').windowAugmentation(dom);

global.document     = browser.document;
global.window       = browser.window;
global.self         = browser.self;
global.navigator    = browser.navigator;
global.location     = browser.location;

var Document        = require("../document"),
    Editor          = require("../editor"), 
    JavaScriptMode  = require("../mode/javascript"),
    MockRenderer    = require("./mockrenderer"),
    assert          = require("./assertions");
    
var Test = {
    "test: delete line from the middle" : function() {
        var doc = new Document(["a", "b", "c", "d"].join("\n"));
        var editor = new Editor(new MockRenderer(), doc);

        editor.moveCursorTo(1, 1);
        editor.removeLines();

        assert.equal(doc.toString(), "a\nc\nd");
        assert.position(editor.getCursorPosition(), 1, 0);

        editor.removeLines();

        assert.equal(doc.toString(), "a\nd");
        assert.position(editor.getCursorPosition(), 1, 0);

        editor.removeLines();

        assert.equal(doc.toString(), "a\n");
        assert.position(editor.getCursorPosition(), 1, 0);

        editor.removeLines();

        assert.equal(doc.toString(), "a\n");
        assert.position(editor.getCursorPosition(), 1, 0);
    },

    "test: delete multiple selected lines" : function() {
        var doc = new Document(["a", "b", "c", "d"].join("\n"));
        var editor = new Editor(new MockRenderer(), doc);

        editor.moveCursorTo(1, 1);
        editor.getSelection().selectDown();

        editor.removeLines();
        assert.equal(doc.toString(), "a\nd");
        assert.position(editor.getCursorPosition(), 1, 0);
    },

    "test: delete first line" : function() {
        var doc = new Document(["a", "b", "c"].join("\n"));
        var editor = new Editor(new MockRenderer(), doc);

        editor.removeLines();

        assert.equal(doc.toString(), "b\nc");
        assert.position(editor.getCursorPosition(), 0, 0);
    },

    "test: delete last" : function() {
        var doc = new Document(["a", "b", "c"].join("\n"));
        var editor = new Editor(new MockRenderer(), doc);

        editor.moveCursorTo(2, 1);
        editor.removeLines();

        assert.equal(doc.toString(), "a\nb\n");
        assert.position(editor.getCursorPosition(), 2, 0);
    },

    "__test: indent block" : function() {
        var doc = new Document(["a12345", "b12345", "c12345"].join("\n"));
        var editor = new Editor(new MockRenderer(), doc);

        editor.moveCursorTo(1, 3);
        editor.getSelection().selectDown();

        editor.blockIndent("    ");

        assert.equal(["a12345", "    b12345", "    c12345"].join("\n"),
                     doc.toString());

        assert.position(editor.getCursorPosition(), 2, 7);

        var range = editor.getSelectionRange();
        assert.position(range.start, 1, 7);
        assert.position(range.end, 2, 7);
    },

    "__test: outdent block" : function() {
        var doc = new Document(["        a12345", "    b12345", "        c12345"].join("\n"));
        var editor = new Editor(new MockRenderer(), doc);

        editor.moveCursorTo(0, 3);
        editor.getSelection().selectDown();
        editor.getSelection().selectDown();

        editor.blockOutdent("  ");
        assert.equal(doc.toString(), ["    a12345", "b12345", "    c12345"].join("\n"));

        assert.position(editor.getCursorPosition(), 2, 0);

        var range = editor.getSelectionRange();
        assert.position(range.start, 0, 1);
        assert.position(range.end, 2, 1);


        editor.blockOutdent("  ");
        assert.equal(doc.toString(), ["a12345", "b12345", "c12345"].join("\n"));

        var range = editor.getSelectionRange();
        assert.position(range.start, 0, 1);
        assert.position(range.end, 2, 1);
    },

    "test: outent without a selection should update cursor" : function() {
        var doc = new Document("        12");
        var editor = new Editor(new MockRenderer(), doc);

        editor.moveCursorTo(0, 3);
        editor.blockOutdent("  ");

        assert.equal(doc.toString(), "    12");
        assert.position(editor.getCursorPosition(), 0, 0);
    },

    "test: comment lines should perserve selection" : function() {
        var doc = new Document(["  abc", "cde"].join("\n"), new JavaScriptMode());
        var editor = new Editor(new MockRenderer(), doc);

        editor.moveCursorTo(0, 2);
        editor.getSelection().selectDown();

        editor.toggleCommentLines();

        assert.equal(["//  abc", "//cde"].join("\n"), doc.toString());

        var selection = editor.getSelectionRange();
        assert.position(selection.start, 0, 4);
        assert.position(selection.end, 1, 4);
    },

    "test: uncomment lines should perserve selection" : function() {
        var doc = new Document(["//  abc", "//cde"].join("\n"), new JavaScriptMode());
        var editor = new Editor(new MockRenderer(), doc);

        editor.moveCursorTo(0, 1);
        editor.getSelection().selectDown();
        editor.getSelection().selectRight();
        editor.getSelection().selectRight();

        editor.toggleCommentLines();

        assert.equal(["  abc", "cde"].join("\n"), doc.toString());
        assert.range(editor.getSelectionRange(), 0, 0, 1, 1);
    },

    "test: comment lines - if the selection end is at the line start it should stay there": function() {
        //select down
        var doc = new Document(["abc", "cde"].join("\n"), new JavaScriptMode());
        var editor = new Editor(new MockRenderer(), doc);

        editor.moveCursorTo(0, 0);
        editor.getSelection().selectDown();

        editor.toggleCommentLines();
        assert.range(editor.getSelectionRange(), 0, 2, 1, 0);

        // select up
        var doc = new Document(["abc", "cde"].join("\n"), new JavaScriptMode());
        var editor = new Editor(new MockRenderer(), doc);

        editor.moveCursorTo(1, 0);
        editor.getSelection().selectUp();

        editor.toggleCommentLines();
        assert.range(editor.getSelectionRange(), 0, 2, 1, 0);
    },

    "test: move lines down should select moved lines" : function() {
        var doc = new Document(["11", "22", "33", "44"].join("\n"));
        var editor = new Editor(new MockRenderer(), doc);

        editor.moveCursorTo(0, 1);
        editor.getSelection().selectDown();

        editor.moveLinesDown();
        assert.equal(["33", "11", "22", "44"].join("\n"), doc.toString());
        assert.position(editor.getCursorPosition(), 1, 0);
        assert.position(editor.getSelection().getSelectionAnchor(), 3, 0);
        assert.position(editor.getSelection().getSelectionLead(), 1, 0);

        editor.moveLinesDown();
        assert.equal(["33", "44", "11", "22"].join("\n"), doc.toString());
        assert.position(editor.getCursorPosition(), 2, 0);
        assert.position(editor.getSelection().getSelectionAnchor(), 3, 2);
        assert.position(editor.getSelection().getSelectionLead(), 2, 0);

        // moving again should have no effect
        editor.moveLinesDown();
        assert.equal(["33", "44", "11", "22"].join("\n"), doc.toString());
        assert.position(editor.getCursorPosition(), 2, 0);
        assert.position(editor.getSelection().getSelectionAnchor(), 3, 2);
        assert.position(editor.getSelection().getSelectionLead(), 2, 0);
    },

    "__test: move lines up should select moved lines" : function() {
        var doc = new Document(["11", "22", "33", "44"].join("\n"));
        var editor = new Editor(new MockRenderer(), doc);

        editor.moveCursorTo(2, 1);
        editor.getSelection().selectDown();

        editor.moveLinesUp();
        assert.equal(doc.toString(), ["11", "33", "44", "22"].join("\n"));
        assert.position(editor.getCursorPosition(), 1, 0);
        assert.position(editor.getSelection().getSelectionAnchor(), 3, 0);
        assert.position(editor.getSelection().getSelectionLead(), 1, 0);

        editor.moveLinesUp();
        assert.equal(doc.toString(), ["33", "44", "11", "22"].join("\n"));
        assert.position(editor.getCursorPosition(), 0, 0);
        assert.position(editor.getSelection().getSelectionAnchor(), 2, 0);
        assert.position(editor.getSelection().getSelectionLead(), 0, 0);
    },

    "test: move line without active selection should move cursor to start of the moved line" : function()
    {
        var doc = new Document(["11", "22", "33", "44"].join("\n"));
        var editor = new Editor(new MockRenderer(), doc);

        editor.moveCursorTo(1, 1);
        editor.clearSelection();

        editor.moveLinesDown();
        assert.equal(["11", "33", "22", "44"].join("\n"), doc.toString());
        assert.position(editor.getCursorPosition(), 2, 0);

        editor.clearSelection();

        editor.moveLinesUp();
        assert.equal(["11", "22", "33", "44"].join("\n"), doc.toString());
        assert.position(editor.getCursorPosition(), 1, 0);
    },

    "test: copy lines down should select lines and place cursor at the selection start" : function() {
        var doc = new Document(["11", "22", "33", "44"].join("\n"));
        var editor = new Editor(new MockRenderer(), doc);

        editor.moveCursorTo(1, 1);
        editor.getSelection().selectDown();

        editor.copyLinesDown();
        assert.equal(["11", "22", "33", "22", "33", "44"].join("\n"), doc.toString());

        assert.position(editor.getCursorPosition(), 3, 0);
        assert.position(editor.getSelection().getSelectionAnchor(), 5, 0);
        assert.position(editor.getSelection().getSelectionLead(), 3, 0);
    },

    "test: copy lines up should select lines and place cursor at the selection start" : function() {
        var doc = new Document(["11", "22", "33", "44"].join("\n"));
        var editor = new Editor(new MockRenderer(), doc);

        editor.moveCursorTo(1, 1);
        editor.getSelection().selectDown();

        editor.copyLinesUp();
        assert.equal(["11", "22", "33", "22", "33", "44"].join("\n"), doc.toString());

        assert.position(editor.getCursorPosition(), 1, 0);
        assert.position(editor.getSelection().getSelectionAnchor(), 3, 0);
        assert.position(editor.getSelection().getSelectionLead(), 1, 0);
    },

    "test: input a tab with soft tab should convert it to spaces" : function() {
        var doc = new Document("");
        var editor = new Editor(new MockRenderer(), doc);

        doc.setTabSize(2);
        doc.setUseSoftTabs(true);

        editor.onTextInput("\t");
        assert.equal(doc.toString(), "  ");

        doc.setTabSize(5);
        editor.onTextInput("\t");
        assert.equal(doc.toString(), "       ");
    },

    "test: input tab without soft tabs should keep the tab character" : function() {
        var doc = new Document("");
        var editor = new Editor(new MockRenderer(), doc);

        doc.setUseSoftTabs(false);

        editor.onTextInput("\t");
        assert.equal(doc.toString(), "\t");
    }
};

module.exports = require("async/test").testcase(Test);

if (module === require.main)
    module.exports.exec()