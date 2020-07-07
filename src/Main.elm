module Main exposing (..)

import Browser
import Element exposing (..)
import Element.Background as Background
import Element.Font as Font
import Element.Input as Input
import Element.Lazy
import Http



-- MAIN


main =
    Browser.element { init = init, update = update, view = view, subscriptions = subscriptions }



-- MODEL


type alias Model =
    { content : String
    , xml : String
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { content = "fn main(): list pitch_rhythm { return [d4 quarter, d4 quarter, a4 quarter, a4 quarter, b4 quarter, b4 quarter, a4 half]; }"
      , xml = ""
      }
    , Cmd.none
    )



-- UPDATE


type Msg
    = CompileRequest String
    | FetchedCompiledXml (Result Http.Error String)


compileCode : String -> Cmd Msg
compileCode sourceCode =
    Http.post
        { url = "/api/compile"
        , body = Http.stringBody "text/plain" sourceCode
        , expect = Http.expectString FetchedCompiledXml
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
                    ( { model | xml = s }, Cmd.none )

                Err e ->
                    ( model, Cmd.none )


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
                { url = "https://fonts.googleapis.com/css?family=EB+Garamond"
                , name = "EB Garamond"
                }
            , Font.sansSerif
            ]
        ]
        (codeEditor model)



--codeEditor model


codeEditor model =
    row []
        [ Input.multiline
            [ Background.color (rgba 1 1 1 1)
            , Font.color (rgba 0 0 0 1)
            , width (fillPortion 5)
            , height fill
            ]
            (codeEditorConfig "sky source code" model.content)
        , Element.paragraph
            [ Background.color (rgba 1 1 1 1)
            , Font.color (rgba 0 0 0 1)
            , width (fillPortion 5)
            , height fill
            ]
            [ text model.xml ]
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
