module Main exposing (..)

import Browser
import Debug exposing (log, toString)
import Element exposing (..)
import Element.Background as Background
import Element.Font as Font
import Element.Input as Input
import Element.Lazy
import Http
import Json.Decode exposing (Decoder, bool, null, oneOf, string)
import Json.Decode.Pipeline exposing (optional, required)
import Task



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
            { content = "fn main(): list pitch_rhythm {\n  return [d4 quarter, d4 quarter, a4 quarter, a4 quarter,\n          b4 quarter, b4 quarter, a4 half]; \n}"
            , xml = ""
            , errMsg = Nothing
            }
    in
    ( model, Task.succeed (CompileRequest model.content) |> Task.perform (\n -> n) )



-- UPDATE


type Msg
    = CompileRequest String
    | FetchedCompiledXml (Result Http.Error CompileServiceResponse)


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
                    ( { model | xml = log "xml content" xmlContent, errMsg = errMsg }, Cmd.none )

                Err e ->
                    ( log (toString e) model, Cmd.none )


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
        [ Input.multiline
            [ Background.color (rgba 1 1 1 1)
            , Font.color (rgba 0 0 0 1)
            , width <| fillPortion 5
            , height fill
            ]
            (codeEditorConfig "sky source code" model.content)
        , case model.errMsg of
            Just err ->
                Element.el [ width <| fillPortion 5, height fill, Font.color (rgba 255 50 50 1) ] (text err)

            Nothing ->
                Element.image
                    [ width <| fillPortion 5
                    , height fill
                    ]
                    { src = log "debug model xml" model.xml
                    , description = "Compiled image from source code"
                    }
        ]


codeEditorConfig : String -> String -> { label : Input.Label msg, onChange : String -> Msg, placeholder : Maybe (Input.Placeholder msg), spellcheck : Bool, text : String }
codeEditorConfig label text =
    { label = Input.labelHidden label
    , onChange = \n -> CompileRequest n
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
