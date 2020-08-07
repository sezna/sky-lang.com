
function setCode(progName) {
  editor.setValue(exampleCode[progName], -1);
}

var editor = ace.edit("editor");
editor.setValue(localStorage.getItem('editorCode') || exampleCode["twinkle"], -1);

function compileCodeAndUpdateDOM() {

  let code = editor.getValue();
  localStorage.setItem('editorCode', code);
  let body = { code };
  let resp = fetch("/api/compile", {
    method: "POST",
    mode: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then((resp) => resp.json())
    .then((data) => {
      let { isOk, content } = data;
      if (!isOk) {
        document.getElementById("download-button").setAttribute("disabled", "");
        document.getElementById("play-audio").setAttribute("disabled", "");
        document.getElementById("dropdown").className = "";
        let { line, column } = data;
        if (errorMarker) {
          editor.session.removeMarker(errorMarker);
        }
        errorMarker = editor.session.addMarker(
          new Range(line - 1, column, line - 1, column + 1),
          "marked",
          "text"
        );
        document.getElementById(
          "music-content"
        ).innerHTML = `<div class=\"err\">${content}</div>`;
      } else {
        if (errorMarker) {
          editor.session.removeMarker(errorMarker);
        }
        let { pdfLink, xmlLink, midiLink, lyLink } = data;
        let dropdown = document.getElementById("dropdown");
        dropdown.className = "dropdown";
        document.getElementById("download-button").removeAttribute("disabled");
        //document.getElementById("play-audio").removeAttribute("disabled");
        document.getElementById("pdf").innerHTML = `<a href=${pdfLink}>PDF</a>`;
        document.getElementById("musicxml").innerHTML = `<a href=${xmlLink}>MusicXML</a>`;
        document.getElementById("midi").innerHTML = `<a href=${midiLink}>MIDI</a>`;
        document.getElementById("lilypond").innerHTML = `<a href=${lyLink}>Lilypond</a>`;
        document.getElementById(
          "music-content"
        ).innerHTML = `<img src=${content}></img>`;
      }
    });
}

define("ace/mode/custom", [], function (require, exports, module) {
  var oop = require("ace/lib/oop");
  var TextMode = require("ace/mode/text").Mode;
  var Tokenizer = require("ace/tokenizer").Tokenizer;
  var CustomHighlightRules = require("ace/mode/custom_highlight_rules")
    .CustomHighlightRules;

  var Mode = function () {
    this.HighlightRules = CustomHighlightRules;
  };
  oop.inherits(Mode, TextMode);

  (function () {}.call(Mode.prototype));

  exports.Mode = Mode;
});

define("ace/mode/custom_highlight_rules", [], function (
  require,
  exports,
  module
) {
  var oop = require("ace/lib/oop");
  var TextHighlightRules = require("ace/mode/text_highlight_rules")
    .TextHighlightRules;

  var CustomHighlightRules = function () {
    var keywordMapper = this.createKeywordMapper(
      {
        "variable.language": "this",
        keyword: "test|words",
        "constant.language": "true|false|null",
      },
      "text",
      true
    );

    this.$rules = {
      start: [
        {
          regex: /--(.*)$/,
          token: "comment"
        },
        {
          regex: /(^|\s+)(fn|list|pitch_rhythm|pitch|rhythm|number|boolean)(?=(\s+))/,
          token: "sky-keyword"
        
        },
        {
          regex: /(^|\s+)(if|then|else|while|for|return)(?=(\s+))/,
          token: "control-flow-keyword"
        },
        {
          regex: /[a-gA-G][#|b|n]?[0-9]((\s+dotted)?)\s+(half|whole|quarter|eighth|sixteenth|thirty-second|sixty-fourth)/,
          token: "pitch-rhythm-token"
        },
        {
          regex: /(dotted\s+)?(half|whole|quarter|eighth|sixteenth|thirty-second|sixty-fourth)/,
          token: "rhythm-token"
        },
        {
          regex: /[a-gA-G][#|b|n]?[0-9]/,
          token: "pitch-token"
        },
        {
          regex: /[0-9]/,
          token: "numeric-token",
        },
        {
          regex: /(\S+)(?=\()/,
          token: "function-app-token"
        },
      ],
    };
    this.normalizeRules();
  };

  oop.inherits(CustomHighlightRules, TextHighlightRules);

  exports.CustomHighlightRules = CustomHighlightRules;
});


editor.session.setMode("ace/mode/custom");
editor.renderer.setOption("showPrintMargin", false);
editor.container.style.background="#2E282A";
editor.setFontSize("16px");
editor.container.style.color="#FFF";
let Range = ace.require("ace/range").Range;
let errorMarker;

