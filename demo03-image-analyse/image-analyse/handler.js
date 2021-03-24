'use strict';
const {promises:{readFile}} = require('fs');
class Handler{
  constructor({rekoSvc, translateSvc}){
    this.rekoSvc = rekoSvc;
    this.translateSvc = translateSvc;
  }

  async detectImageLabels(buffer){
    const result = await this.rekoSvc.detectLabels({
      Image: {
        Bytes : buffer,
      }
    }).promise()
    const workingItems = result.Labels.filter(({Confidence}) => Confidence>80)
    const names = workingItems.map(({Name})=> Name).join(' and ')
    return {names, workingItems};
  }
  
  async translateText(text){
    const params = {
      SourceLanguageCode: 'en',
      TargetLanguageCode: 'pt',
      Text: text
    }
    const {TranslatedText} = await this.translateSvc.translateText(params).promise()
    return TranslatedText.split(' e ');
  }

  formatTextResult(texts, workingItems){
    const finalText = [];
    for(const indexText in texts){
      const nameInPortuguese = texts[indexText];
      const confidence = workingItems[indexText].Confidence;
      finalText.push(`
        ${confidence.toFixed(2)}% de ser do tipo ${nameInPortuguese}
      `)
    }
    return finalText.join('\n');
  }

  async main(event){
    try {
      const imgBuffer = await readFile('./images/image.jpeg')
      console.log('Detecting Labels...');
      const {names, workingItems} = await this.detectImageLabels(imgBuffer);
      console.log({names, workingItems})
      console.log('Translate to PT-BR...');
      const texts = await this.translateText(names)
      console.log('Handle final file')
      const finalText = this.formatTextResult(texts, workingItems)
      console.log('Finishing...');
      return{
        statusCode: 200,
        body: `A imagem tem `.concat(finalText)
      }
    } catch (error) {
      console.log('ERROR!',error.stack)
      return{
        statusCode: 500,
        body: 'Internal Server Error!'
      }
    }
  }
}

//factory
const aws = require('aws-sdk');
const reko = new aws.Rekognition();
const translate = new aws.Translate();
const handler = new Handler({
  rekoSvc:reko,
  translateSvc: translate
})
module.exports.main = handler.main.bind(handler)


