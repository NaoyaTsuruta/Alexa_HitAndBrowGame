'use strict'

const Alexa = require('ask-sdk');
 
let skill;
exports.handler = async function (event, context) {
    if (!skill) {
      skill = Alexa.SkillBuilders.custom()
        .addRequestHandlers(
            LaunchRequestHandler,
            HelpIntentHandler,
            StartIntentHandler,
            NumberIntentHandler,
            HintIntentHandler,
            AnserIntentHandler,
            StopIntentHandler,
        )
        .addErrorHandlers(ErrorHandler)
        .create();
    }
    return skill.invoke(event);
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'LaunchRequest';
    },

    handle(handlerInput) {
        const LaunchSpeech = 'ヒットアンドブローへようこそ！';
        const AskSpeech = 'ゲームを始めたいときは「スタート」、ゲームのルールを教えて欲しいときは「ヘルプ」と言ってください。';

        const speech = LaunchSpeech + AskSpeech;

        return handlerInput.responseBuilder
            .speak(speech)
            .reprompt(AskSpeech)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput){
        const request = handlerInput.requestEnvelope.request;

        return  request.type === 'IntentRequest'
        &&      request.intent.name === 'AMAZON.HelpIntent';
    },

    handle(handlerInput) {
        const HelpSpeech1 = 'ヒットアンドブローのルールを説明します。このゲームは三つの数字を当てるゲームです。';
        const HelpSpeech2 = 'あなたの回答に、ヒットとブローの数を答えます。';
        const HelpSpeech3 = 'ヒットは数字も位置も同じ、ブローは数字はあたっているけど位置が違います。';
        const HelpSpeech4 = '数字に重複はありません。';
        const StartSpeech = 'さぁ「スタート」と言ってゲームを始めましょう！';

        const speech = HelpSpeech1 + HelpSpeech2 + HelpSpeech3 + HelpSpeech4 + StartSpeech;

        return handlerInput.responseBuilder
            .speak(speech)
            .reprompt(StartSpeech)
            .getResponse();
    }

};

const StartIntentHandler = {
    canHandle(handlerInput){
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest'
        && request.intent.name === 'StartIntent';
    },

    handle(handlerInput){
        var r;
        var n = [];
        const array = [0,1,2,3,4,5,6,7,8,9];

        for(var i=0;i<3;i=i+1){
            r = Math.floor(Math.random() * array.length);
            n[i] = array[r];
            array.splice(r,1);
        }
        handlerInput.attributesManager.setSessionAttributes({'number': n});
        
        const Speech = '私の考えている3桁の数字を当ててください。';
        const AskSpeech = 'あなたの予想を言って下さい'

        const speech = Speech + AskSpeech;

        return handlerInput.responseBuilder
            .speak(speech)
            .reprompt(AskSpeech)
            .getResponse();

    }
};

const NumberIntentHandler = {
    canHandle(handlerInput){
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest'
        && request.intent.name === 'NumberIntent';
    },

    handle(handlerInput){
        var hit = 0;
        var blow = 0;
        const number = handlerInput.attributesManager.getSessionAttributes().number;
        if(!number){
            return handlerInput.responseBuilder
            .speak('まだゲームは始まってはいませんよ。まずは「スタート」と言ってください')
            .reprompt('「スタート」と言ってください')
            .getResponse();
        }
        const ask = handlerInput.requestEnvelope.request.intent.slots.number.value;
        var asknum = [];

        asknum[0] = Math.floor(ask/100);
        asknum[1] = Math.floor((ask%100)/10);
        asknum[2] = Math.floor((ask%100)%10);

        for(var i=0;i<3;i=i+1){
            
            if(number[i] == asknum[i]){
                hit = hit + 1;
            }

            for(var j=0;j<3;j=j+1){
                if(number[i] == asknum[j]){
                    blow = blow + 1;
                }
            }

        }
        blow = blow - hit;

        const Speech = '結果は' + hit + 'ヒット、' + blow + 'ブローでした。';
        const hitSpeech = '結果は<break time="2s"/>3ヒット！！！正解です。おめでとうございます！！';
        const AskSpeech = '次のあなたの予想の数字を教えて下さい。'
        const HintSpeech = 'ヒント、と言ってくれたら数字を少し教えてあげましょう';
        const speech = Speech + AskSpeech;

        if(hit == 3){
            return handlerInput.responseBuilder
            .speak(hitSpeech)
            .getResponse();
        }else{
            return handlerInput.responseBuilder
            .speak(speech)
            .reprompt(HintSpeech)
            .getResponse();
        }
    }
};

const StopIntentHandler = {

    canHandle(handlerInput){
        const request = handlerInput.requestEnvelope.request;
    
        return request.type === 'IntentRequest'
            && (request.intent.name === 'AMAZON.StopIntent'
            ||  request.intent.name === 'AMAZON.CancelIntent');
        },
    
    handle(handlerInput){
        return handlerInput.responseBuilder
                .speak()
                .getResponse();
    }
};

const HintIntentHandler = {

    canHandle(handlerInput){
        const request = handlerInput.requestEnvelope.request;
    
        return request.type === 'IntentRequest'
            && request.intent.name === 'HintIntent';
        },
    
    handle(handlerInput){
        //const hint_al = handlerInput.attributesManager.getSessionAttributes().hint_al;

        //const hint_alSpeech = 'ヒントはさっき教えましたよ。ヒントは一回までです。';
        const AskSpeech = '次のあなたの予想を言って下さい';
        //const hint_al_speech = hint_alSpeech + AskSpeech;

        /*if(hint_al === 'already'){
            return handlerInput.responseBuilder
                .speak(hint_al_speech)
                .reprompt(AskSpeech)
                .getResponse();
        }*/

        const number = handlerInput.attributesManager.getSessionAttributes().number;
        //handlerInput.attributesManager.setSessionAttributes({'hint_al':'already'});
        if(!number){
            return handlerInput.responseBuilder
            .speak('まだゲームは始まってはいませんよ。まずは「スタート」と言ってください')
            .reprompt('「スタート」と言ってください')
            .getResponse();
        }
        
        var hint = number[Math.floor(Math.random() * number.length)];

        const LaunchHintSpeech = '仕方ない、ヒントをあげましょう。特別ですよ？';
        const HintSpeech = '数字の一つは' + hint + 'です。';

        const speech = LaunchHintSpeech + HintSpeech + AskSpeech;
    
        return handlerInput.responseBuilder
            .speak(speech)
            .reprompt(AskSpeech)
            .getResponse();
    }
};

const AnserIntentHandler = {

    canHandle(handlerInput){
        const request = handlerInput.requestEnvelope.request;
    
        return request.type === 'IntentRequest'
            && request.intent.name === 'AnserIntent';
        },
    
    handle(handlerInput){
        const number = handlerInput.attributesManager.getSessionAttributes().number;
        if(!number){
            return handlerInput.responseBuilder
            .speak('まだゲームは始まっていませんよ。まずは「スタート」と言ってください')
            .reprompt('「スタート」と言ってください')
            .getResponse();
        }

        const AnserSpeech = '答えは' + number[0] + number[1] + number[2] + 'でした。' + '次は正解まで頑張って見ましょう！';


        return handlerInput.responseBuilder
                .speak(AnserSpeech)
                .getResponse();
    }
};

const ErrorHandler = {
    canHandle(handlerInput, error) {
        return true;
    },
    handle(handlerInput, error) {
        return handlerInput.responseBuilder
            .speak('うまくいきませんでした、ごめんなさい。')
            .getResponse();
    }
}
