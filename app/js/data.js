// ===== Conteúdo do kit "Mapa do Tesouro: Missão Pirata" (Psicóloga Roberta Leitão, CRP 10/08929) =====
// Tudo aqui vem das pranchas e dos guias do kit. Traduções para ES/EN feitas para o app; PT é a fonte.
const LANGS = ['pt', 'es', 'en'];
const LOCALE_IDIOMA = { pt: 'pt-BR', es: 'es', en: 'en' };

// Catálogo de missões. img: ilustração recortada do kit (web/app/img). cat: manha | noite | escola | casa | convivencia. dificil: vale 2 moedas.
const MISSOES = [
  { id: 'cama', img: 'ic-bed', cat: 'manha', t: { pt: 'Arrumar a cama', es: 'Tender la cama', en: 'Make the bed' } },
  { id: 'dentes_m', img: 'ic-tooth', cat: 'manha', t: { pt: 'Escovar os dentes de manhã', es: 'Cepillarse los dientes por la mañana', en: 'Brush teeth in the morning' } },
  { id: 'roupa', img: 'ic-clothes', cat: 'manha', t: { pt: 'Vestir a roupa sozinho', es: 'Vestirse solo', en: 'Get dressed on your own' } },
  { id: 'cafe', img: 'ic-food', cat: 'manha', t: { pt: 'Tomar o café da manhã', es: 'Desayunar', en: 'Eat breakfast' } },
  { id: 'mochila', img: 'ic-backpack', cat: 'escola', t: { pt: 'Arrumar a mochila', es: 'Preparar la mochila', en: 'Pack the backpack' } },
  { id: 'horario', img: 'sol', cat: 'manha', t: { pt: 'Sair de casa no horário', es: 'Salir de casa a tiempo', en: 'Leave home on time' } },
  { id: 'tarefa', img: 'ic-book', cat: 'escola', dificil: true, t: { pt: 'Fazer o dever de casa', es: 'Hacer la tarea', en: 'Do the homework' } },
  { id: 'agenda', img: 'ic-calendar', cat: 'escola', t: { pt: 'Mostrar a agenda da escola', es: 'Mostrar la agenda de la escuela', en: 'Show the school planner' } },
  { id: 'lancheira', img: 'ic-food', cat: 'escola', t: { pt: 'Trazer a lancheira de volta', es: 'Traer la lonchera de vuelta', en: 'Bring the lunchbox back' } },
  { id: 'brinquedos', img: 'ic-toys', cat: 'casa', t: { pt: 'Guardar os brinquedos', es: 'Guardar los juguetes', en: 'Put the toys away' } },
  { id: 'materiais', img: 'ic-art', cat: 'casa', t: { pt: 'Organizar os materiais', es: 'Ordenar los materiales', en: 'Organize school supplies' } },
  { id: 'mesa', img: 'ic-pasta', cat: 'casa', t: { pt: 'Ajudar a pôr a mesa', es: 'Ayudar a poner la mesa', en: 'Help set the table' } },
  { id: 'prato', img: 'ic-food', cat: 'casa', dificil: true, t: { pt: 'Comer a refeição combinada', es: 'Comer la comida acordada', en: 'Eat the agreed meal' } },
  { id: 'agua', img: 'ic-bath', cat: 'casa', t: { pt: 'Beber água durante o dia', es: 'Beber agua durante el día', en: 'Drink water during the day' } },
  { id: 'pet', img: 'papagaio', cat: 'casa', t: { pt: 'Cuidar do bichinho de estimação', es: 'Cuidar a la mascota', en: 'Take care of the pet' } },
  { id: 'calma', img: 'moeda-esforco', cat: 'convivencia', dificil: true, t: { pt: 'Falar com calma', es: 'Hablar con calma', en: 'Speak calmly' } },
  { id: 'pedir', img: 'ic-friends', cat: 'convivencia', t: { pt: 'Pedir com "por favor" e agradecer', es: 'Pedir "por favor" y dar las gracias', en: 'Say please and thank you' } },
  { id: 'esperar', img: 'moeda-foco', cat: 'convivencia', dificil: true, t: { pt: 'Esperar a vez de falar', es: 'Esperar el turno para hablar', en: 'Wait for your turn to speak' } },
  { id: 'tela_off', img: 'ic-tv', cat: 'convivencia', dificil: true, t: { pt: 'Desligar a tela quando o tempo acabar', es: 'Apagar la pantalla cuando se acabe el tiempo', en: 'Turn off the screen when time is up' } },
  { id: 'ajudar', img: 'ic-friends', cat: 'convivencia', t: { pt: 'Ajudar alguém da família', es: 'Ayudar a alguien de la familia', en: 'Help a family member' } },
  { id: 'banho', img: 'ic-bath', cat: 'noite', t: { pt: 'Tomar banho sem discussão', es: 'Bañarse sin discutir', en: 'Take a bath without fuss' } },
  { id: 'pijama', img: 'ic-pajamas', cat: 'noite', t: { pt: 'Vestir o pijama', es: 'Ponerse el pijama', en: 'Put on pajamas' } },
  { id: 'dentes_n', img: 'ic-tooth-n', cat: 'noite', t: { pt: 'Escovar os dentes à noite', es: 'Cepillarse los dientes por la noche', en: 'Brush teeth at night' } },
  { id: 'ler', img: 'ic-book-n', cat: 'noite', t: { pt: 'Ler ou ouvir uma história', es: 'Leer o escuchar un cuento', en: 'Read or listen to a story' } },
  { id: 'dormir', img: 'ic-bed-n', cat: 'noite', dificil: true, t: { pt: 'Ir para a cama no horário', es: 'Ir a la cama a la hora', en: 'Go to bed on time' } }
];
const CATS = ['manha', 'escola', 'casa', 'convivencia', 'noite'];

// Cartela de Recompensas do kit + sugestões do Guia dos Pais (experiências, não coisas).
const RECOMPENSAS = [
  { id: 'tela', img: 'ic-tv', t: { pt: 'Tempo de tela extra', es: 'Tiempo extra de pantalla', en: 'Extra screen time' } },
  { id: 'dia', img: 'ic-calendar', t: { pt: 'Dia especial', es: 'Día especial', en: 'Special day' } },
  { id: 'passeio', img: 'ic-ferris', t: { pt: 'Escolher o passeio', es: 'Elegir el paseo', en: 'Choose the outing' } },
  { id: 'filme', img: 'ic-popcorn', t: { pt: 'Noite do filme', es: 'Noche de película', en: 'Movie night' } },
  { id: 'amigo', img: 'ic-friends', t: { pt: 'Convidar um amigo', es: 'Invitar a un amigo', en: 'Invite a friend' } },
  { id: 'jantar', img: 'ic-pasta', t: { pt: 'Escolher o jantar', es: 'Elegir la cena', en: 'Choose dinner' } },
  { id: 'livro', img: 'ic-book', t: { pt: 'Ler o livro preferido junto', es: 'Leer el libro favorito juntos', en: 'Read the favorite book together' } },
  { id: 'atividade', img: 'ic-art', t: { pt: 'Atividade divertida', es: 'Actividad divertida', en: 'Fun activity' } },
  { id: 'brincadeira', img: 'ic-star', t: { pt: 'Brincadeira especial com o adulto', es: 'Juego especial con el adulto', en: 'Special play time with the adult' } },
  { id: 'tempo', img: 'moeda-coragem', t: { pt: 'Tempo só nós dois', es: 'Tiempo solo nosotros dos', en: 'Time just the two of us' } }
];

// Ilha da Calma — 10 caminhos. x,y: posição (%) do número na prancha 'Mapa da Ilha da Calma' (img/ilha-calma.png).
const CALMA = [
  { n: 1, x: 9.2, y: 97.3, t: { pt: ['Respira como o mar', 'Puxe o ar contando até 4. Solte contando até 4. Como a onda que vai e volta.'], es: ['Respira como el mar', 'Toma aire contando hasta 4. Suelta contando hasta 4. Como la ola que va y vuelve.'], en: ['Breathe like the sea', 'Breathe in counting to 4. Breathe out counting to 4. Like a wave that comes and goes.'] } },
  { n: 2, x: 17.4, y: 83.2, t: { pt: ['Conta as moedas', 'Conte devagar até 10, uma moeda de cada vez.'], es: ['Cuenta las monedas', 'Cuenta despacio hasta 10, una moneda a la vez.'], en: ['Count the coins', 'Count slowly to 10, one coin at a time.'] } },
  { n: 3, x: 28.1, y: 91.9, t: { pt: ['Ancora no porto', 'Peça um abraço para quem você confia, quando você quiser.'], es: ['Ancla en el puerto', 'Pide un abrazo a alguien de confianza, cuando quieras.'], en: ['Anchor at the harbor', 'Ask someone you trust for a hug, whenever you want.'] } },
  { n: 4, x: 37.7, y: 75.6, t: { pt: ['Água do cantil', 'Beba um copo de água devagar, em goles pequenos.'], es: ['Agua de la cantimplora', 'Bebe un vaso de agua despacio, a sorbos pequeños.'], en: ['Water from the canteen', 'Drink a glass of water slowly, in small sips.'] } },
  { n: 5, x: 46.6, y: 85.1, t: { pt: ['Baixa as velas', 'Menos luz, menos barulho. Peça ajuda para deixar tudo mais calmo.'], es: ['Baja las velas', 'Menos luz, menos ruido. Pide ayuda para calmar el ambiente.'], en: ['Lower the sails', 'Less light, less noise. Ask for help to make things calmer.'] } },
  { n: 6, x: 56.1, y: 70.2, t: { pt: ['Cabine do capitão', 'Vá para o seu canto preferido e fique ali o tempo que precisar.'], es: ['Cabina del capitán', 'Ve a tu rincón favorito y quédate el tiempo que necesites.'], en: ["Captain's cabin", 'Go to your favorite spot and stay as long as you need.'] } },
  { n: 7, x: 65.4, y: 78.9, t: { pt: ['Cantiga do mar', 'Coloque uma música calma e ouça até o corpo desacelerar.'], es: ['Canción del mar', 'Pon una música tranquila y escucha hasta que el cuerpo se calme.'], en: ['Sea song', 'Play calm music and listen until your body slows down.'] } },
  { n: 8, x: 74.3, y: 61.6, t: { pt: ['Carta náutica', 'Desenhe o que você está sentindo. Não precisa mostrar para ninguém.'], es: ['Carta náutica', 'Dibuja lo que sientes. No hace falta mostrárselo a nadie.'], en: ['Nautical chart', "Draw what you're feeling. You don't have to show anyone."] } },
  { n: 9, x: 82.3, y: 69.7, t: { pt: ['Tesouro de bolso', 'Segure o seu objeto preferido, aquele que acalma.'], es: ['Tesoro de bolsillo', 'Sostén tu objeto favorito, el que te calma.'], en: ['Pocket treasure', 'Hold your favorite object, the one that calms you.'] } },
  { n: 10, x: 90.4, y: 50.8, t: { pt: ['O mapa do dia', 'Olhe o seu Quadro de Missões e veja o que vem agora.'], es: ['El mapa del día', 'Mira tu tablero de misiones y ve qué viene ahora.'], en: ['The map of the day', 'Look at your Mission Board and see what comes next.'] } }
];

// "Pirata em Missão": frases da prancha.
const AFIRMACOES = {
  pt: ['Eu me esforço', 'Eu aprendo todos os dias', 'Eu sou gentil', 'Eu faço o meu melhor', 'Eu tenho foco', 'Eu tenho coragem', 'Eu faço escolhas positivas', 'Eu sou único e especial'],
  es: ['Me esfuerzo', 'Aprendo todos los días', 'Soy amable', 'Hago lo mejor que puedo', 'Tengo foco', 'Tengo valentía', 'Tomo decisiones positivas', 'Soy único y especial'],
  en: ['I try hard', 'I learn every day', 'I am kind', 'I do my best', 'I stay focused', 'I am brave', 'I make positive choices', 'I am unique and special']
};

// Guia dos Pais (10 passos) + regras do baú, resumidos com fidelidade ao kit.
const GUIA = {
  pt: [
    ['Apresentando a missão', 'Convide a criança para entrar na aventura: ela será um pequeno pirata em busca de um grande tesouro. Cada missão cumprida rende moedas, que vão para o baú.'],
    ['Escolhendo as missões', 'Escolha de 3 a 5 comportamentos claros e objetivos. Mais que isso cansa a tripulação.'],
    ['Entregando as moedas', 'Sempre que a criança cumprir uma missão, entregue a moeda imediatamente. O reconhecimento rápido aumenta o engajamento.'],
    ['Acompanhando o mapa', 'Marque diariamente as missões concluídas. No início, a participação do adulto é fundamental.'],
    ['Recompensas do tesouro', 'Combine as recompensas com antecedência. Prefira experiências: um passeio, uma brincadeira especial, um filme em família.'],
    ['Regra de ouro', 'Moeda conquistada nunca volta para o baú do capitão. Tirar o que já foi ganho transforma a brincadeira em punição.'],
    ['O papel dos pais', 'Incentivo, reconhecimento e vínculo fazem a diferença. Elogie junto com a moeda.'],
    ['Comece simples', 'É melhor três missões cumpridas do que dez combinadas e abandonadas. Mantenha as mesmas missões por algumas semanas.'],
    ['Quando o interesse cair', 'Troque as recompensas antes que fiquem previsíveis, reduza o número de missões e volte a celebrar as pequenas. Se a criança falhar várias vezes seguidas, a meta está alta demais: baixe a meta, nunca a moeda.'],
    ['A tela é um combinado', 'A tela não é prêmio nem castigo. Quem decide quantos minutos vale uma moeda é a família, junto, e o número vale a semana inteira.']
  ],
  es: [
    ['Presentar la misión', 'Invita al niño a entrar en la aventura: será un pequeño pirata en busca de un gran tesoro. Cada misión cumplida da monedas, que van al cofre.'],
    ['Elegir las misiones', 'Elige de 3 a 5 conductas claras y objetivas. Más que eso cansa a la tripulación.'],
    ['Entregar las monedas', 'Cada vez que el niño cumpla una misión, entrega la moneda de inmediato. El reconocimiento rápido aumenta el compromiso.'],
    ['Seguir el mapa', 'Marca a diario las misiones cumplidas. Al principio, la participación del adulto es fundamental.'],
    ['Recompensas del tesoro', 'Acuerda las recompensas con antelación. Prefiere experiencias: un paseo, un juego especial, una película en familia.'],
    ['Regla de oro', 'Una moneda ganada nunca vuelve al cofre del capitán. Quitar lo ya ganado convierte el juego en castigo.'],
    ['El papel de los padres', 'Ánimo, reconocimiento y vínculo marcan la diferencia. Elogia junto con la moneda.'],
    ['Empieza simple', 'Mejor tres misiones cumplidas que diez acordadas y abandonadas. Mantén las mismas misiones durante algunas semanas.'],
    ['Cuando baje el interés', 'Cambia las recompensas antes de que sean previsibles, reduce el número de misiones y vuelve a celebrar las pequeñas. Si el niño falla varias veces seguidas, la meta es demasiado alta: baja la meta, nunca la moneda.'],
    ['La pantalla es un acuerdo', 'La pantalla no es premio ni castigo. La familia decide junta cuántos minutos vale una moneda, y el número vale toda la semana.']
  ],
  en: [
    ['Introducing the mission', 'Invite the child into the adventure: they will be a little pirate searching for a great treasure. Each completed mission earns coins that go into the chest.'],
    ['Choosing the missions', 'Choose 3 to 5 clear, objective behaviors. More than that tires the crew.'],
    ['Handing over the coins', 'Whenever the child completes a mission, give the coin immediately. Quick recognition increases engagement.'],
    ['Following the map', 'Mark completed missions every day. At the start, the adult’s participation is essential.'],
    ['Treasure rewards', 'Agree on rewards in advance. Prefer experiences: an outing, a special game, a family movie.'],
    ['Golden rule', 'A coin earned never goes back to the captain’s chest. Taking away what was earned turns play into punishment.'],
    ['The parents’ role', 'Encouragement, recognition and connection make the difference. Praise along with the coin.'],
    ['Start simple', 'Three missions completed beat ten agreed and abandoned. Keep the same missions for a few weeks.'],
    ['When interest drops', 'Change rewards before they become predictable, reduce the number of missions and celebrate the small wins again. If the child fails several times in a row, the goal is too high: lower the goal, never the coin.'],
    ['Screens are an agreement', 'The screen is neither prize nor punishment. The family decides together how many minutes a coin is worth, and the number holds for the whole week.']
  ]
};

// Para o adulto, durante a crise (Bônus Regulação Emocional).
const CRISE = {
  pt: { titulo: 'Para o capitão adulto', faz: ['Regule você primeiro: a criança usa o adulto como referência.', 'Valide: "Eu sei que você ficou bravo. Estou aqui."', 'Fale pouco e devagar: "Vamos respirar juntos."', 'Ajude a perceber o corpo: coração acelerado, mãos tensas.'], evita: ['Gritos e ameaças', 'Longos sermões', 'Comparar a criança', 'Exigir controle imediato'], depois: 'Depois da crise, quando estiver calma: converse brevemente, valide as emoções, retome os limites e ensine alternativas.' },
  es: { titulo: 'Para el capitán adulto', faz: ['Regúlate tú primero: el niño usa al adulto como referencia.', 'Valida: "Sé que te enojaste. Estoy aquí."', 'Habla poco y despacio: "Respiremos juntos."', 'Ayuda a notar el cuerpo: corazón acelerado, manos tensas.'], evita: ['Gritos y amenazas', 'Sermones largos', 'Comparar al niño', 'Exigir control inmediato'], depois: 'Después de la crisis, cuando esté en calma: conversa brevemente, valida las emociones, retoma los límites y enseña alternativas.' },
  en: { titulo: 'For the adult captain', faz: ['Regulate yourself first: the child uses the adult as a reference.', 'Validate: "I know you got angry. I’m here."', 'Speak little and slowly: "Let’s breathe together."', 'Help notice the body: racing heart, tense hands.'], evita: ['Yelling and threats', 'Long lectures', 'Comparing the child', 'Demanding immediate control'], depois: 'After the crisis, once calm: talk briefly, validate the emotions, restore the limits and teach alternatives.' }
};

// Tabela de Valores (padrão do kit; a família pode ajustar).
const VALORES_PADRAO = { missao: 1, dificil: 2, raraDias: 3, premios: [5, 10, 20] };

// ===== Conteúdo acrescentado em 09/10/2026 (segue a linha do Bônus Regulação Emocional: validar → nomear → oferecer um caminho) =====

// "O que dizer": falas prontas para o adulto nos momentos que mais travam a rotina de 4 a 8 anos.
// Cada item: [momento, o que a criança costuma fazer, o que dizer, por que funciona].
const FRASES = {
  pt: [
    ['Manhã, ninguém se mexe', 'Enrola, não troca de roupa, "só mais um pouquinho".', '"Falta a roupa e a mochila. Qual você faz primeiro?" Depois: "Pronto, uma moeda a caminho."', 'Duas escolhas fechadas dão controle sem abrir negociação. A moeda vira a próxima coisa boa, não a ameaça.'],
    ['Hora do dever', 'Chora, diz que não sabe, levanta a cada minuto.', '"Vamos fazer só a primeira linha juntos. Depois você me mostra a segunda."', 'Dividir em um pedaço pequeno tira o tamanho do monstro. "Comecei" já vale no app.'],
    ['Desligar a tela', 'Grita, pede mais cinco minutos, chora quando desliga.', '"Faltam 5 minutos." Depois: "Falta 1." No fim: "Eu sei que é chato parar. Amanhã tem mais. Desliga comigo?"', 'O aviso prepara o cérebro para a transição. Desligar junto, e não por ela, é o que vira missão cumprida.'],
    ['Não quer tomar banho', '"Daqui a pouco", esconde, inventa dor de barriga.', '"Banho de espuma ou banho rápido de chuveiro? Você escolhe, eu ligo a água."', 'Quando a criança escolhe o como, para de brigar pelo se.'],
    ['Hora de dormir', 'Pede água, mais uma história, levanta de novo.', '"Uma história e um abraço. Depois a lanterna apaga e eu fico aqui mais um minutinho."', 'Um ritual curto e igual todo dia avisa o corpo de que é hora. O "mais um minutinho" é previsível, não negociado.'],
    ['Birra na frente de todo mundo', 'Joga no chão, grita, bate.', 'Agache, fale baixo: "Você está muito bravo. Eu estou aqui. Vamos respirar como o mar?"', 'Na crise não se ensina nada; só se acompanha. A conversa vem depois, quando a tempestade passou.'],
    ['Não quer dividir / briga com irmão', 'Puxa, grita "é meu", chora.', '"Vocês dois querem o mesmo. Quem usa primeiro e por quanto tempo?"', 'Nomear o problema sem escolher lado e devolver a solução para eles. Cada irmão tem seu próprio mapa.'],
    ['Esqueceu a missão', 'Lembra só na hora de dormir que não fez.', '"Hoje não deu. Amanhã é um dia novo e a missão está lá." Sem moeda, sem sermão.', 'O dia sem moeda é a consequência inteira. Ficar repetindo o erro tira o foco da próxima chance.'],
    ['Perdeu a graça', 'Dá de ombros para a moeda, não quer olhar o mapa.', '"O que você acha de trocar o prêmio da casa 10? Me diz uma ideia."', 'Interesse cai quando o prêmio ficou previsível. Trocar o prêmio e reduzir as missões reacende; aumentar a cobrança apaga.'],
    ['Pediu com "por favor"', 'Fez o que você queria sem ninguém mandar.', '"Você pediu com calma e esperou. Eu reparei." Entregue a moeda olhando no olho.', 'Elogio que descreve o que aconteceu ensina mais do que "parabéns". A moeda confirma.']
  ],
  es: [
    ['Mañana, nadie se mueve', 'Se demora, no se cambia, "un ratito más".', '"Falta la ropa y la mochila. ¿Cuál haces primero?" Después: "Listo, una moneda en camino."', 'Dos opciones cerradas dan control sin abrir negociación. La moneda es lo bueno que viene, no la amenaza.'],
    ['Hora de la tarea', 'Llora, dice que no sabe, se levanta a cada minuto.', '"Hagamos solo la primera línea juntos. Después me muestras la segunda."', 'Dividir en un trozo pequeño le quita tamaño al monstruo. "Empecé" ya cuenta en la app.'],
    ['Apagar la pantalla', 'Grita, pide cinco minutos más, llora cuando se apaga.', '"Faltan 5 minutos." Después: "Falta 1." Al final: "Sé que es feo parar. Mañana hay más. ¿Apagamos juntos?"', 'El aviso prepara al cerebro para la transición. Apagar juntos, y no por él, es lo que se vuelve misión cumplida.'],
    ['No quiere bañarse', '"Ahorita", se esconde, inventa dolor de panza.', '"¿Baño de espuma o ducha rápida? Tú eliges, yo abro el agua."', 'Cuando el niño elige el cómo, deja de pelear por el si.'],
    ['Hora de dormir', 'Pide agua, un cuento más, se levanta otra vez.', '"Un cuento y un abrazo. Después la linterna se apaga y me quedo un minutito más."', 'Un ritual corto e igual cada día le avisa al cuerpo que es hora. El "minutito más" es previsible, no negociado.'],
    ['Berrinche delante de todos', 'Se tira al suelo, grita, pega.', 'Agáchate, habla bajo: "Estás muy enojado. Estoy aquí. ¿Respiramos como el mar?"', 'En la crisis no se enseña nada; solo se acompaña. La conversación viene después, cuando pasó la tormenta.'],
    ['No quiere compartir / pelea con el hermano', 'Jala, grita "es mío", llora.', '"Los dos quieren lo mismo. ¿Quién lo usa primero y por cuánto tiempo?"', 'Nombrar el problema sin elegir bando y devolverles la solución. Cada hermano tiene su propio mapa.'],
    ['Olvidó la misión', 'Se acuerda a la hora de dormir de que no la hizo.', '"Hoy no se pudo. Mañana es un día nuevo y la misión sigue ahí." Sin moneda, sin sermón.', 'El día sin moneda es toda la consecuencia. Repetir el error le quita el foco a la próxima oportunidad.'],
    ['Perdió la gracia', 'Se encoge de hombros ante la moneda, no quiere mirar el mapa.', '"¿Qué te parece cambiar el premio de la casilla 10? Dime una idea."', 'El interés cae cuando el premio se volvió previsible. Cambiar el premio y reducir misiones lo reaviva; exigir más lo apaga.'],
    ['Pidió "por favor"', 'Hizo lo que querías sin que nadie lo mandara.', '"Pediste con calma y esperaste. Me di cuenta." Entrega la moneda mirándolo a los ojos.', 'Un elogio que describe lo que pasó enseña más que "felicidades". La moneda lo confirma.']
  ],
  en: [
    ['Morning, nobody moves', 'Stalls, won\'t get dressed, "just a little longer".', '"Clothes and backpack are left. Which one first?" Then: "Done, a coin is on its way."', 'Two closed choices give control without opening a negotiation. The coin is the next good thing, not a threat.'],
    ['Homework time', 'Cries, says they don\'t know, gets up every minute.', '"Let\'s do just the first line together. Then you show me the second."', 'Cutting it into one small piece shrinks the monster. "Started" already counts in the app.'],
    ['Turning the screen off', 'Yells, asks for five more minutes, cries when it goes off.', '"5 minutes left." Then: "1 minute." At the end: "I know stopping is no fun. There\'s more tomorrow. Turn it off with me?"', 'The warning readies the brain for the transition. Turning it off together, not for them, is what becomes a completed mission.'],
    ['Won\'t take a bath', '"In a minute", hides, invents a tummy ache.', '"Bubble bath or quick shower? You pick, I turn on the water."', 'When the child picks the how, they stop fighting about the whether.'],
    ['Bedtime', 'Asks for water, one more story, gets up again.', '"One story and one hug. Then the lantern goes off and I stay one more minute."', 'A short ritual, the same every night, tells the body it\'s time. The "one more minute" is predictable, not negotiated.'],
    ['Meltdown in front of everyone', 'Drops to the floor, screams, hits.', 'Crouch down, speak low: "You\'re really angry. I\'m here. Shall we breathe like the sea?"', 'Nothing is taught during a meltdown; you only stay close. The talk comes later, once the storm has passed.'],
    ['Won\'t share / fights with sibling', 'Grabs, yells "it\'s mine", cries.', '"You both want the same thing. Who goes first and for how long?"', 'Name the problem without taking sides and hand the solution back to them. Each sibling has their own map.'],
    ['Forgot the mission', 'Only remembers at bedtime that it wasn\'t done.', '"Today didn\'t work out. Tomorrow is a new day and the mission is still there." No coin, no lecture.', 'The day without a coin is the whole consequence. Dwelling on the slip takes focus off the next chance.'],
    ['Lost interest', 'Shrugs at the coin, won\'t look at the map.', '"How about we swap the prize at square 10? Give me an idea."', 'Interest drops when the prize became predictable. Swapping the prize and trimming missions relights it; pushing harder puts it out.'],
    ['Said "please"', 'Did what you wanted without being told.', '"You asked calmly and waited. I noticed." Hand over the coin looking them in the eye.', 'Praise that describes what happened teaches more than "good job". The coin confirms it.']
  ]
};
// Perguntas que todo mundo faz (Guia dos pais). [pergunta, resposta]
const FAQ = {
  pt: [
    ['Posso tirar uma moeda quando ele se comporta mal?', 'Não. É a regra de ouro do kit: moeda conquistada nunca volta. No dia em que a moeda vira castigo, a brincadeira acaba e o que fica é a briga. O mau comportamento tem a consequência dele, separada do mapa: o dia sem moeda nova já é a consequência inteira.'],
    ['E se ele esquecer a missão?', 'Não ganha a moeda naquele dia, e só. Nada de sermão nem de recuperar no dia seguinte. Se esquecer três dias seguidos, a missão está grande demais ou mal colocada no dia: diminua ou troque o momento.'],
    ['Tenho dois filhos. Como faço?', 'Cada um tem o próprio mapa, as próprias missões e o próprio tesouro, mesmo que o prêmio seja o mesmo. O que vale para um não precisa valer para o outro. E não compare o andamento dos dois em voz alta.'],
    ['Na segunda semana ele perdeu o interesse. Desisto?', 'Não, ajuste. Troque o prêmio da próxima casa por um que ele escolha, reduza para três missões e volte a celebrar a moeda com barulho. Interesse cai quando o prêmio ficou previsível, não quando a criança "não liga".'],
    ['Tempo de tela pode ser prêmio?', 'Pode ser um combinado, não um prêmio nem um castigo. Na Missão Telas, vocês decidem uma vez quantos minutos vale uma moeda e isso vale a semana inteira. A tela desliga quando acaba, sem tirar moeda de ninguém.'],
    ['Quando paro de usar?', 'Quando a missão virou hábito: a criança faz sem olhar o mapa. Aí ela sai da lista e entra outra. O mapa é uma ponte, não uma muleta; a maioria das famílias usa por alguns meses e guarda para quando a rotina muda de novo (férias, escola nova, irmão novo).'],
    ['Ele chegou na casa 20 em uma semana. Foi fácil demais?', 'Foi um bom começo. Na nova viagem, deixe de fora as missões que já ficaram fáceis e coloque uma ou duas que custam mais. O ritmo bom é entre duas e quatro semanas por mapa.']
  ],
  es: [
    ['¿Puedo quitarle una moneda cuando se porta mal?', 'No. Es la regla de oro del kit: una moneda ganada nunca vuelve. El día en que la moneda se vuelve castigo, el juego se termina y lo que queda es la pelea. El mal comportamiento tiene su propia consecuencia, separada del mapa: el día sin moneda nueva ya es toda la consecuencia.'],
    ['¿Y si se olvida de la misión?', 'No gana la moneda ese día, y ya. Nada de sermón ni de recuperarla al día siguiente. Si se olvida tres días seguidos, la misión es demasiado grande o está mal ubicada en el día: achícala o cambia el momento.'],
    ['Tengo dos hijos. ¿Cómo lo hago?', 'Cada uno tiene su propio mapa, sus propias misiones y su propio tesoro, aunque el premio sea el mismo. Lo que vale para uno no tiene que valer para el otro. Y no compares el avance de los dos en voz alta.'],
    ['En la segunda semana perdió el interés. ¿Me rindo?', 'No, ajusta. Cambia el premio de la próxima casilla por uno que él elija, reduce a tres misiones y vuelve a celebrar la moneda con ruido. El interés cae cuando el premio se volvió previsible, no cuando al niño "no le importa".'],
    ['¿El tiempo de pantalla puede ser premio?', 'Puede ser un acuerdo, no un premio ni un castigo. En la Misión Pantallas deciden una vez cuántos minutos vale una moneda y eso vale toda la semana. La pantalla se apaga cuando se acaba, sin quitarle monedas a nadie.'],
    ['¿Cuándo dejo de usarlo?', 'Cuando la misión se volvió hábito: el niño la hace sin mirar el mapa. Entonces sale de la lista y entra otra. El mapa es un puente, no una muleta; la mayoría de las familias lo usa unos meses y lo guarda para cuando la rutina cambia otra vez (vacaciones, escuela nueva, hermano nuevo).'],
    ['Llegó a la casilla 20 en una semana. ¿Fue demasiado fácil?', 'Fue un buen comienzo. En el nuevo viaje, deja fuera las misiones que ya son fáciles y pon una o dos que cuesten más. El buen ritmo es entre dos y cuatro semanas por mapa.']
  ],
  en: [
    ['Can I take a coin away when they misbehave?', 'No. It\'s the kit\'s golden rule: an earned coin never goes back. The day the coin becomes punishment, the game ends and what\'s left is the fight. Misbehavior has its own consequence, separate from the map: a day with no new coin is already the whole consequence.'],
    ['What if they forget the mission?', 'No coin that day, and that\'s it. No lecture and no making it up the next day. If they forget three days in a row, the mission is too big or badly placed in the day: shrink it or move the moment.'],
    ['I have two kids. How does it work?', 'Each one has their own map, missions and treasure, even if the prize is the same. What holds for one doesn\'t have to hold for the other. And don\'t compare their progress out loud.'],
    ['In week two they lost interest. Should I give up?', 'No, adjust. Swap the next square\'s prize for one they choose, cut down to three missions and go back to celebrating the coin loudly. Interest drops when the prize became predictable, not because the child "doesn\'t care".'],
    ['Can screen time be a prize?', 'It can be a deal, not a prize or a punishment. In the Screen Mission you decide once how many minutes a coin is worth and that holds all week. The screen goes off when time is up, with no coins taken from anyone.'],
    ['When do I stop using it?', 'When the mission has become habit: the child does it without looking at the map. Then it leaves the list and another comes in. The map is a bridge, not a crutch; most families use it for a few months and keep it for when the routine shifts again (holidays, new school, new sibling).'],
    ['They reached square 20 in a week. Was it too easy?', 'It was a good start. On the new voyage, leave out the missions that are already easy and add one or two that cost more. A good pace is two to four weeks per map.']
  ]
};

// Dica para o adulto em cada caminho da Ilha da Calma (como conduzir sem virar ordem). Índice = n - 1.
const CALMA_ADULTO = {
  pt: ['Faça junto, em voz alta, com a mão na barriga. Quatro vezes bastam.', 'Conte com a criança, devagar. Se perder a conta, recomecem rindo.', 'Ofereça, não imponha: "quer um abraço?" Se disser não, fique por perto.', 'Pegue o copo você. Beber devagar obriga a respirar.', 'Apague uma luz, baixe a TV. O ambiente acalma antes da palavra.', 'Deixe ir e não siga. Avise: "quando quiser, eu estou aqui."', 'Uma música que a criança conhece. Sem falar durante.', 'Papel e lápis à mão, sem pedir para ver o desenho.', 'O objeto fica sempre no mesmo lugar, para a criança achar sozinha.', 'Mostre o quadro e aponte só a próxima coisa. Uma, não a lista inteira.'],
  es: ['Hazlo con él, en voz alta, con la mano en la panza. Cuatro veces bastan.', 'Cuenta con él, despacio. Si se pierden, vuelvan a empezar riendo.', 'Ofrece, no impongas: "¿quieres un abrazo?" Si dice no, quédate cerca.', 'Trae tú el vaso. Beber despacio obliga a respirar.', 'Apaga una luz, baja la TV. El ambiente calma antes que la palabra.', 'Déjalo ir y no lo sigas. Avisa: "cuando quieras, aquí estoy."', 'Una música que conoce. Sin hablar mientras suena.', 'Papel y lápiz a mano, sin pedir ver el dibujo.', 'El objeto siempre en el mismo lugar, para que lo encuentre solo.', 'Muestra el tablero y señala solo lo que sigue. Una cosa, no la lista entera.'],
  en: ['Do it with them, out loud, hand on the belly. Four rounds are enough.', 'Count with them, slowly. If you lose count, start over laughing.', 'Offer, don\'t impose: "want a hug?" If they say no, stay nearby.', 'Bring the glass yourself. Drinking slowly forces a breath.', 'Turn off a light, turn down the TV. The room calms before words do.', 'Let them go and don\'t follow. Say: "whenever you want, I\'m here."', 'A song they know. No talking while it plays.', 'Paper and pencil within reach, without asking to see the drawing.', 'The object always in the same place, so they can find it alone.', 'Show the board and point to just the next thing. One, not the whole list.']
};
