module Main exposing (..)

import Browser
import Html exposing (Attribute, Html, div, input, text)
import Html.Attributes exposing (..)
import Html.Events exposing (onInput)
import Http



-- MAIN


main =
    Browser.sandbox { init = init, update = update, view = view }



-- MODEL


type alias Model =
    { content : String
    , xml : String
    }


init : Model
init =
    { content = ""
    , xml = "init value"
    }



-- UPDATE


type Msg
    = Compile String
    | Recv String


compileCode : String -> ( String, Result Http.Error String )
compileCode sourceCode =
    Http.post
        { url = "localhost:1414"
        , body = sourceCode
        , expect = Http.expectString Recv
        }


update : Msg -> Model -> Model
update msg model =
    case msg of
        Compile newSource ->
            { model | content = compileCode.first }

        Recv newXML ->
            { model | xml = newXML }



-- VIEW


view : Model -> Html Msg
view model =
    div []
        [ input [ placeholder "Text to reverse", value model.content, onInput Compile ] []
        , div [] [ text model.xml ]
        ]
