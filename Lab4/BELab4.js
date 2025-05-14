(() => {
  const App = {
    htmlElements: {
      formProduct: document.querySelector('#formProduct'),
      productNumber: document.querySelector('#productNumber'),
      productNumberOutput: document.querySelector('#productTableContainer'),

    },
    init() {

      App.htmlElements.formProduct.addEventListener('submit', App.methods.numberValidation);
      App.htmlElements.productNumberOutput.addEventListener('click', App.methods.deleteCurrentRow);
    
    },
    methods: {

      generateProductTable(e) {
        e.preventDefault();
        const product = parseInt(e.target.elements.productNumber.value);
        let i;
        let outPut = App.htmlElements.productNumberOutput;

        let tablePrint = [
          `<table id="tableProduct">
                  <thead>
                          <tr>
                              <th>#</th>
                              <th>RESULTADO</th>
                              <th>ELIMINAR</th>
                          </tr>
                  </thead>
            <tbody>`
        ]

        for (i = 0; i <= 10; i++) {
          tablePrint += `<tr>
            <td>${product} x ${i + 1}</td>
                <td>${product * (i + 1)}</td>
                <td>
                    <button id="buttonN${i}">Eliminar</button>   
                </td>
                </tr>`

        }

        tablePrint += "</tbody></table>"

          App.methods.print(outPut, tablePrint);

      },

      print(value, txt) {
        value.innerHTML = txt;
      }

      ,deleteCurrentRow(e){
      if (e.target.tagName === "BUTTON") {
    e.target.closest("tr").remove();
  }

      }

      ,numberValidation(e){
        e.preventDefault();
        const number = parseInt(e.target.elements.productNumber.value);
        const warningOutput = App.htmlElements.productNumberOutput;
        let text
        if (number > 20 || number < 1){
          text = "Ingrese un número entre 1 y 20"
        App.methods.print(warningOutput,text)}
        else
        App.methods.generateProductTable(e);
      }

    },
  };

  App.init();
})();
