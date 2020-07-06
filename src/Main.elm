module Main exposing (..)

import Browser
import Debug exposing (log, toString)
import Html exposing (Attribute, Html, div, input, text)
import Html.Attributes exposing (..)
import Html.Events exposing (onInput)
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
            ( { model | content = newSource }, compileCode (log "source: " newSource) )

        FetchedCompiledXml compiledXml ->
            case compiledXml of
                Ok s ->
                    ( { model | xml = s }, Cmd.none )

                Err e ->
                    ( log (toString e) model, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none



-- VIEW


view : Model -> Html Msg
view model =
    div []
        [ input [ placeholder "sky source code", value model.content, onInput CompileRequest ] []
        , div [] [ text model.xml ]
        ]
