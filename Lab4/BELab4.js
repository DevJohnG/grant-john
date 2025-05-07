(() => {
    const App = {
      htmlElements: {
        formProduct : document.querySelector('#formProduct'),
        productNumber : document.querySelector('#productNumber'),
        productNumberOutput : document.querySelector('#productTableContainer')
        // Obtén referencias a tus elementos HTML aquí
        // Ejemplo:
        // salida: document.querySelector('#salida'),
      },
      init() {

        App.htmlElements.formProduct.addEventListener('submit', App.methods.generateProductTable)
        // Inicializa la lógica de tu aplicación aquí
        // Llama a métodos desde App.methods, inicializa eventos, etc.
        // Ejemplo:
        // App.methods.hacerAlgo();
      },
      methods: {

        generateProductTable(e){
            e.preventDefault();
            const {product} = parseInt(e.target.elements.productNumber);
            let i;  
            let outPut = App.htmlElements.productNumberOutput;
            let tablePrint = [
            "<table><thead><tr><th>#</th><th>RESULTADO</th><th>ELIMINAR</th></tr></thead></table>"
            ]

            for (i=0; i <= product;i++){
                tablePrint = "<tbody><tr><td>product</td></tr>";
            }



            tablePrint.forEach(item => {
                App.methods.print(outPut, item)
            });
        },

        print(value, txt){
            value.innerHTML = txt;
        }

        // Define los métodos de tu aplicación aquí
        // Ejemplo:
        // hacerAlgo() {
        //   const elemento = App.htmlElements.salida;
        //   elemento.textContent = '¡Hola desde App!';
        // },
        // imprimir(elemento, texto) {
        //   elemento.innerHTML += `<p>${texto}</p>`;
        // }
      },
    };

    // Inicializa la App
    App.init();
  })();

  /*<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Plantilla App</title>
  <style>
    body {
        background-color: black;
        color: white;
    }
  </style>
</head>
<body>
    <main>
        <h1>Laboratorio #3</h1>
        <section>
            <!-- Problema #1 -->
             <form action="" id="form1">
                <label for="">Numero</label>
                <input type="number" id="input1">
                <button id="calc1">Calcular</button>
                <span id="resp1"></span>
             </form>
        </section>
        <section>
            <form action="" id="form2">
                <label for="">Cadena: </label>
                <input type="text" id="input2">
                <button>Calcular</button>
                <span id="resp2"></span>
            </form>
        </section>
    </main>
  <script>
    (() => {
      const App = {
        htmlElements: {
            form1: document.querySelector('#form1'),
            resp1: document.querySelector('#resp1'),
            form2: document.querySelector('#form2'),
            resp2: document.querySelector('#resp2'),
        },
        init() {
            App.htmlElements.form1.addEventListener('submit', App.methods.onClickCalc1);
            App.htmlElements.form2.addEventListener('submit', App.methods.onClickCalc2);
        },
        methods: {
            onClickCalc1(e) {
                e.preventDefault();
                const { value } = e.target.elements.input1;
                const { resp1 } = App.htmlElements;

                const binary = value.toString(2);
                const isBinaryPalindrome = App.methods.isPalindrome(binary);
                const isDecimalPalindrome = App.methods.isPalindrome(value);

                App.methods.print(resp1, JSON.stringify({ value, isPalindrome: isBinaryPalindrome && isDecimalPalindrome }));
            },
            isPalindrome(value) {
                return value.split('').reverse().join('') === value;
            },
            onClickCalc2(e) {
                e.preventDefault();
                const { value } = e.target.elements.input2;
                const { resp2 } = App.htmlElements;
                const resp = {};
                value.split('').forEach(element => {
                    resp[element] = resp[element] ? resp[element] + 1 : 1;
                });
                App.methods.print(resp2, JSON.stringify({ value, resp }));
            },
            print(e, text) {
                e.innerHTML = <p>${text}</p>
            }
        },
      };

      App.init();
    })();
  </script>
</body>
</html>*/