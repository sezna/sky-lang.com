port module Main exposing (..)

import Browser
import Html exposing (Attribute, Html, div, input, text)
import Html.Attributes exposing (..)
import Html.Events exposing (onInput)



-- MAIN


main =
    Browser.element { init = init, update = update, view = view, subscriptions = subscriptions }



-- PORTS


port sendMessage : String -> Cmd msg


port messageReceiver : (String -> msg) -> Sub msg



-- MODEL


type alias Model =
    { content : String
    , xml : String
    }


init : () -> ( Model, Cmd Msg )
init flags =
    ( { content = ""
      , xml = "init value"
      }
    , Cmd.none
    )



-- UPDATE


type Msg
    = Compile String
    | Recv String


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Compile newSource ->
            ( { model | content = newSource }, sendMessage model.content )

        Recv newXML ->
            ( { model | xml = newXML }, Cmd.none )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    messageReceiver Recv



-- VIEW


view : Model -> Html Msg
view model =
    div []
        [ input [ placeholder "Text to reverse", value model.content, onInput Compile ] []
        , div [] [ text model.xml ]
        ]
