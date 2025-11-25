📺 Netflix Clone (TMDb)



✨ Sobre o Projeto




O Netflix Clone (TMDb) é uma réplica moderna da interface de usuário (UI) da Netflix, desenvolvida com foco em design responsivo e interatividade. O projeto utiliza a API pública do The Movie Database (TMDb) para buscar e exibir dados reais de filmes e séries, preenchendo o Hero Banner e as fileiras de carrosséis.

O objetivo principal foi praticar a integração com uma API externa (Fetch API), a manipulação do DOM em JavaScript puro e a gestão de estado local (como a "Minha Lista") utilizando localStorage. O design é totalmente baseado no framework Tailwind CSS, garantindo uma experiência de visualização fluida em qualquer dispositivo.



🌟 Funcionalidades



Hero Banner Dinâmico: Exibe um título de destaque que alterna automaticamente a cada 8 segundos, com transição suave e detalhes visuais.

Carrosséis de Conteúdo: Exibe múltiplas fileiras de pôsteres (Ex: "Tendências", "Filmes Populares", "Séries Mais Votadas") com rolagem horizontal e botões de navegação.

Filtros de Mídia: Permite ao usuário filtrar o conteúdo da página entre Todos, Séries, Filmes e Minha Lista.

Modal de Detalhes: Ao clicar em qualquer pôster, um modal (pop-up) é aberto, buscando detalhes completos do item (sinopse, data, elenco, duração, etc.) em tempo real da API.

Minha Lista (Favoritos): Funcionalidade para adicionar ou remover qualquer filme ou série à uma lista pessoal, com persistência de dados via localStorage.

Design Responsivo: Layout adaptável para telas grandes (desktop) e pequenas (mobile) graças ao Tailwind CSS.



🛠️ Tecnologias Utilizadas



O projeto é 100% Front-End, focando na performance e usabilidade do lado do cliente:

HTML5: Estrutura e semântica do projeto.

CSS3 (Tailwind CSS): Framework de utilidades para estilização rápida, moderna e responsiva.

JavaScript (ES6+): Lógica de carregamento de dados, controle de carrosséis, funções do modal, e toda a gestão da Minha Lista (localStorage).

API: Integração com a The Movie Database (TMDb) para buscar e exibir conteúdo real.




🚀 Como Executar o Projeto




Como este é um projeto totalmente client-side, a execução é simples, mas requer uma chave de API válida para buscar os dados.



Pré-requisitos



Um navegador moderno (Chrome, Firefox, Edge, Safari).

Uma chave de API válida da TMDb. Você pode obter uma gratuitamente registrando-se no site oficial do TMDb.



Passo a Passo


Clone o Repositório (ou baixe os arquivos zipados).

Bash


git clone https://github.com/Renato8318/Netflix-Clone/tree/main



Configure a API Key:




Abra o arquivo script.js.

Na primeira linha de configuração, substitua o texto SUA_CHAVE_AQUI pela sua chave TMDb real.



JavaScript



const API_KEY = 'SUA_CHAVE_AQUI'; 


Abra o Arquivo:

Abra o arquivo index.html diretamente no seu navegador (clique duas vezes no arquivo).

A aplicação será carregada, e os carrosséis devem começar a exibir os pôsteres dos filmes e séries.



👤 Autor



O projeto Netflix Clone (TMDb) foi desenvolvido por:



Renato Paiva

   Função: Desenvolvedor Front-End

   GitHub: https://github.com/Renato8318

   LinkedIn: https://www.linkedin.com/in/renato-paiva-developer/



📄 Licença


Este projeto está licenciado sob a Licença MIT.
