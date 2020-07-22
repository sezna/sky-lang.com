module Main exposing (..)

import Browser
import Element exposing (..)
import Element.Background as Background
import Element.Font as Font
import Element.Input as Input
import Element.Lazy
import Http
import Json.Decode exposing (Decoder, bool, null, oneOf, string)
import Json.Decode.Pipeline exposing (optional, required)
import Task
import Editor exposing (Editor, EditorConfig, EditorMsg)
import Editor.Config exposing (WrapOption(..))
import Editor.Strings



-- MAIN


main =
    Browser.element { init = init, update = update, view = view, subscriptions = subscriptions }



-- MODEL


type alias Model =
    { content : String
    , xml : String
    , errMsg : Maybe String
    }


init : () -> ( Model, Cmd Msg )
init _ =
    let
        model =
            { content = """
-- helper functions you use must be declared before main

fn pointless_if_comparison(num: number): pitch_rhythm {
   -- ifs are expressions
   return if num < 5 then a4 quarter else e4 quarter;
}

-- all sky programs need a main function which returns the contents of the music

fn main(): list list pitch_rhythm {

  -- lists of pitches with associated rhythms can be interpreted as parts to a piece

  list pitch_rhythm twinkle_twinkle_melody =
     [d4 quarter, d4 quarter, a4 quarter, a#4 quarter,
      b4 quarter, b4 quarter, a4 half];

  list pitch_rhythm twinkle_twinkle_harmony =
     [d3 half,               \\f#3, a3\\ half,
      f#3 dotted eighth, g3 sixteenth, f#3 eighth, b2 eighth, \\e3, c#3\\ half ];


  -- combining these two lists into a 2d list means that the piece has multiple parts

  list list pitch_rhythm twinkle_twinkle = [twinkle_twinkle_melody, twinkle_twinkle_harmony];

  -- parts can be indexed and assigned properties as seen fit
  twinkle_twinkle.key = d major;
  twinkle_twinkle[0].dynamic = f;
  twinkle_twinkle[0].part_id = melody;
  twinkle_twinkle[0][3] = pointless_if_comparison(3);
  twinkle_twinkle[1].part_id = harmony;
  twinkle_twinkle[1].dynamic = mp;
  twinkle_twinkle[1].clef = bass;

  -- whatever is returned from `main` is what is rendered on the right
  return twinkle_twinkle;
}
            
"""
            , xml = ""
            , errMsg = Nothing
            }
    in
    ( model, Task.succeed (CompileRequest model.content) |> Task.perform (\n -> n) )



-- UPDATE


type Msg
    = CompileRequest String
    | FetchedCompiledXml (Result Http.Error CompileServiceResponse)
    | UpdateContent String


compileCode : String -> Cmd Msg
compileCode sourceCode =
    Http.post
        { url = "/api/compile/png"
        , body = Http.stringBody "text/plain" sourceCode
        , expect = Http.expectJson FetchedCompiledXml decodeCompileServiceResponse
        }


wrapMsg : Result Http.Error String -> String
wrapMsg res =
    case res of
        Err e ->
            "Error!"

        Ok s ->
            s


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        CompileRequest newSource ->
            ( { model | content = newSource }, compileCode newSource )

        FetchedCompiledXml compiledXml ->
            case compiledXml of
                Ok s ->
                    let
                        xmlContent =
                            if s.isOk then
                                s.content

                            else
                                ""

                        errMsg =
                            if not s.isOk then
                                Just s.content

                            else
                                Nothing
                    in
                    ( { model | xml = xmlContent, errMsg = errMsg }, Cmd.none )

                Err e ->
                    ( model, Cmd.none )

        UpdateContent str ->
            ( { model | content = str }, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none



-- VIEW


view model =
    Element.layout
        [ Background.color (rgba 0 0 0 1)
        , height fill
        , width fill
        , Font.color (rgba 1 1 1 1)
        , Font.size 16
        , Font.family
            [ Font.external
                { url = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&display=swap"
                , name = "IBM Plex Mono"
                }
            , Font.monospace
            ]
        ]
        (codeEditor model)


codeEditor model =
    row [ height fill, width fill ]
        [ column [ width <| fillPortion 5, height fill ]
            [ Input.button
                [ Font.center
                , Font.size 16
                , height <| px 50
                , width fill
                ]
                { onPress = Just (CompileRequest model.content), label = text "Run Code" }
            , Input.multiline
                [ Background.color (rgba 1 1 1 1)
                , Font.color (rgba 0 0 0 1)
                , height fill
                ]
                (codeEditorConfig "sky source code" model.content)
            ]
        , case model.errMsg of
            Just err ->
                Element.el [ width <| fillPortion 5, height fill, Font.color (rgba 255 50 50 1) ] (text err)

            Nothing ->
               -- column [ width <| fillPortion 5, height fill ]
               --     [ Input.button
               --         [ Font.center
               --         , Font.size 16
               --         , height <| px 50
               --         , width fill
               --         ]
               --         { onPress = Nothing, label = text "Play Audio" }
                     Element.image
                        []
                        { src = model.xml
                        , description = "Compiled image from source code"
                        }
              --      ]
        ]


codeEditorConfig : String -> String -> { label : Input.Label msg, onChange : String -> Msg, placeholder : Maybe (Input.Placeholder msg), spellcheck : Bool, text : String }
codeEditorConfig label text =
    { label = Input.labelHidden label
    , onChange = \n -> UpdateContent n
    , placeholder = Nothing
    , spellcheck =
        False
    , text = text
    }


type alias CompileServiceResponse =
    { isOk : Bool
    , content : String
    }


decodeCompileServiceResponse : Decoder CompileServiceResponse
decodeCompileServiceResponse =
    Json.Decode.succeed CompileServiceResponse
        |> required "isOk" bool
        |> required "content" string



-- either an error message or a link to the rendered image
