(() => {
    const App = {
      htmlElements: {
        formProduct : document.querySelector('#formProduct'),
        productNumber : document.querySelector('#productNumber'),
        productNumberOutput : document.querySelector('#productTableContainer')
        
      },
      init() {

        App.htmlElements.formProduct.addEventListener('submit', App.methods.generateProductTable);

      },
      methods: {

        generateProductTable(e){
            e.preventDefault();
            const product = parseInt(e.target.elements.productNumber.value);
            let i;  
            let outPut = App.htmlElements.productNumberOutput;

            let tablePrint = [
            "<table><thead><tr><th>#</th><th>RESULTADO</th><th>ELIMINAR</th></tr></thead><tbody>"
            ]

            for (i=0; i <= 10;i++){
                tablePrint.push(`<${i}tr><td>${product} x ${i+1}</td><td>${product * (i+1)}</td>`);

                const columnButton = document.createElement("td")
                const buttonDelete = document.createElement("button")

                columnButton.appendChild(buttonDelete)

                buttonDelete.addEventListener('click', tablePrint[i].remove)

            }

            

            tablePrint.push("</tbody></table>");

            tablePrint.forEach(item => {
                App.methods.print(outPut, tablePrint.join(''));
            });
        },

        print(value, txt){
            value.innerHTML = txt;
        }

      },
    };

    App.init();
  })();
