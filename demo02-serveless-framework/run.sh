#1 - instalar
npm i -g serverless
#2 - inicializar
serverless ou sls
#3 A cada alteracao realizar um deploy
sls deploy
#4para invocar pela aws 
sls invoke -f hello
#invocar localemente
sls invoke local -f hello --log
#configurar dashboard
sls
#ficar buscando logs de invocacoes de uam funcao especifica
sls logs -f hello -t