//**** CARGAR Y MOSTRAR LOS DATOS */
//1. Definir objeto de muebles - Carga inicial - Inventario
import {mueblesCargaManual, carritoCompraManual, MUEBLES_KEY, CARRITO_KEY} from "./BBDD/BBDD.js"



import {closeModal, configurarFormularioParaAgregar, configurarFormularioParaEdicion, editarProductosStock, mostrarMueblesInventario, eliminarProductosStock, handleDeleteClick, openModalBtn, overlay, closeModalBtn, cancelModalBtn, formulario, resetFormulario, inicializarControles} from "./functions-page/controles-modal.js"

//Variable para almacenar los muebles con los que trabajar
export let muebles = []
/***************LISTA DE PRODUCTOS *********/

//Cargar muebles
export function cargarMueblesStock(){
  //Intenta obtener muebles del localstorage
  const mueblesCargados = JSON.parse(localStorage.getItem(MUEBLES_KEY))
  if (mueblesCargados){
    //Si hay muebles en LocalStorage, los cargamos
    console.log('Cargando muebles desde LocalStorage')
    muebles = mueblesCargados
  } else {
    // Si no hay muebles en LocalStorage, usamos los predefinidos y los guardamos
    console.log('No hay muebles en LocalStorage, cargando datos iniciales')
    muebles = mueblesCargaManual
    // console.log('El string del array de objetos de la variable muebles es: ', JSON.stringify(muebles))
    console.log('la variable muebles es: ', muebles)
    localStorage.setItem(MUEBLES_KEY, JSON.stringify(muebles))
  }
  return muebles
}
  
export function mostrarMuebles() {
  cargarMueblesStock()
  console.log('Variable muebles desde dentro de la funcion mostrar muebles es: ', muebles)
  const contenedorMuebles = document.getElementById('productList') //Contenedor de la lista productos
  
  // Si no hay contenedor o no hay muebles, salimos de la función
  if (!contenedorMuebles) {
    console.error('No se encontró el contenedor de productos (#productList)')
    return
  }
  
  console.log('Contenedor productList encontrado:', contenedorMuebles)
  
  if (!muebles || !muebles.length) {
    console.error('No hay muebles guardados')
    contenedorMuebles.innerHTML = '<p style="color:peru; text-align:center;">No hay productos disponibles</p>'
    return
  }
  
  console.log('Mostrando', muebles.length, 'productos en la tienda')
  
  // Limpiar el contenedor antes de añadir nuevos elementos
  contenedorMuebles.innerHTML = ''
  
  // Recorrer cada mueble y crear su tarjeta
  muebles.forEach(mueble => {
    // Crear la estructura HTML para cada mueble
    const muebleHTML = `
      <article class="product-card">
        <figure class="product-card--image">
          <img src="./assets/images/${mueble.img}" alt="${mueble.nombre}">
        </figure>
        <div class="product-card--info--container">
          <h3 class="product-card--name">${mueble.nombre}</h3>
          <p class="product-card--description">Dimensiones: ${mueble.dimensiones}</p>
          <p class="product-card--price">${mueble.precio.toFixed(2)}€</p>
          <button class="product-card--add-btn btn-primary" data-id="${mueble.id}">
            <span class="material-symbols-outlined">shopping_cart</span> 
            Añadir al carrito
          </button>
        </div>
      </article>
    `
  
    // Añadir el HTML al contenedor
    contenedorMuebles.innerHTML += muebleHTML;
    console.log(`Añadido mueble ${mueble.id} - ${mueble.nombre} a la tienda`)
  })
  
  // Añadir event listeners a los botones después de crear las tarjetas
  agregarEventosCarrito()
} //Fin mostrar lista de productos

/******** CARRITO DE COMPRA ********/
//Cargar elementosdel carrito en el LocalStorage
function cargarCarrito() {
  let carrito = []
  const carritoCargado = JSON.parse(localStorage.getItem(CARRITO_KEY))
  if (carritoCargado){
    //Si hay muebles en LocalStorage, los cargamos
    console.log('Cargando carrito desde LocalStorage')
    carrito = carritoCargado
  } else {
    // Si no existe el carrito en LocalStorage, lo añadimos vacio
    console.log('No hay elementos en el carrito desde el LocalStorage, cargando datos iniciales')
    
    
    localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito))
  }
  return carrito
}

//5. Mostrar los datos del carrito de compra 
  // Función para mostrar la lista de los elementos del carrito de la compra
function mostrarCarrito() {
  const carrito = cargarCarrito()
  const contenedorCarrito = document.querySelector('#cartList') //Contenedor lista carrito
  
  console.log("Carrito cargado:", carrito)
  
  // Verificar si existe el contenedor
  if (!contenedorCarrito) {
    console.error('No se encontró el contenedor del carrito (#cartList)')
    return
  }
  
  console.log('Contenedor cartList encontrado:', contenedorCarrito)
  
  //Muestra mensaje de error si no hay elementos en el carrito
  if (!carrito || !carrito.length) {
    console.log('No hay elementos en el carrito de la compra')
    contenedorCarrito.innerHTML = '<p style="color:peru;">No hay productos en el carrito</p>'
    return
  }
  
  console.log('Mostrando', carrito.length, 'productos en el carrito')
  
  //Limpiar el contenedor de la lista del carrito
  contenedorCarrito.innerHTML = ''
  carrito.forEach(articuloCarrito => {
    //Crear la estructura del carrito html
    const carritoHTML = `
        <article class="cart-list--list-item">
          <div class="list-item--info">
              <div class="list-item--info--name">
                  ${articuloCarrito.nombre}
              </div>
              <div class="list-item--info--description">
                  Cantidad: 1
              </div>
              <div class="list-item--info--price">
                  ${articuloCarrito.precio.toFixed(2)}€
              </div>
          </div>
          <div class="list-item--action">
              <button class="btn-ghost btn-square-32px btn-remove" data-id="${articuloCarrito.id}">
                  <span class="material-symbols-outlined">
                      close
                      </span>
              </button>
          </div>
        </article>
      `
    //Añadir elementos htlm a la lista
    contenedorCarrito.innerHTML += carritoHTML
    console.log(`Añadido producto ${articuloCarrito.id} - ${articuloCarrito.nombre} al carrito`)
  })
  // Añadir listeners a los botones de eliminar
  eliminarElementoCarrito()
}

//Calcular el total del coste de la compra
function costeTotal() {
  const contenedorCoste = document.getElementById('totalPriceValue')
  // Verificar si existe el contenedor
  if (!contenedorCoste) {
    console.error('No se encontró el contenedor para el coste total')
    return
  }
  
  const carrito = cargarCarrito() //Obtener carrito actualizado
  //calcular la suma de la clave orecio de cada elemento de la lista
  let sumaTotal = 0
  
  if (carrito && carrito.length) {
    for(let i = 0; i < carrito.length; i++) {
      sumaTotal += carrito[i].precio
    }
  }
  
  contenedorCoste.innerHTML = `${sumaTotal.toFixed(2)}€`
  console.log('sumaTotal es igual a: ', sumaTotal)
}
  
/******************
  INTERACTIVIDAD  
******************/
/**** AÑADIR DATOS AL CARRITO - */
//1. Función para manejar los eventos de los botones "Añadir al carrito"
function agregarEventosCarrito() {
  const botonesAdd = document.querySelectorAll('.product-card--add-btn')
  
  botonesAdd.forEach(boton => {
    //Añadir función en el click
    boton.addEventListener('click', function() {
      //Obtener la clave del id desde el atributo del botón
      const muebleId = parseInt(this.getAttribute('data-id'))
      console.log(`Producto con ID ${muebleId} añadido al carrito`)
      
      // Añadir la lógica para agregar el producto al carrito
      //Asociar id del botón con el objeto 
      const muebleSeleccionado = muebles.find(mueble => mueble.id === muebleId)
      console.log("El mueble seleccionado para añadir es: ", muebleSeleccionado)
      
      if (muebleSeleccionado) {
        // Obtener el carrito actual
        let carrito = cargarCarrito()
        
        // Verificar si el producto ya está en el carrito
        const productoExistente = carrito.find(item => item.id === muebleId)
        
        if (!productoExistente) {
          // Añadir el producto al carrito con cantidad 1
          const muebleCarrito = { ...muebleSeleccionado, cantidad: 1 }
          carrito.push(muebleCarrito)
          
          // Guardar el carrito actualizado en localStorage
          localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito))
          
          // Actualizar la visualización del carrito
          mostrarCarrito()
          costeTotal()
          
          console.log("Producto añadido al carrito:", muebleCarrito)
        } else {
          alert("El producto ya está en el carrito")
          // Aquí puedes agregar lógica para incrementar la cantidad si lo deseas
        }
      }
    })
  })
}

/**** ELIMINAR DATOS DEL CARRITO */
function eliminarElementoCarrito() {
  let botonesBorrar = document.querySelectorAll(".btn-remove");
  
  botonesBorrar.forEach(boton => {
    boton.addEventListener('click', function() {
      //Obtener la clave del id desde el atributo del botón
      const muebleId = parseInt(this.getAttribute('data-id'))
      console.log(`Producto con ID ${muebleId} eliminado del carrito`)
      
      // Obtener el carrito actual
      let carrito = cargarCarrito()
      
      // Filtrar para eliminar el producto seleccionado
      carrito = carrito.filter(mueble => mueble.id !== muebleId)
      console.log("El nuevo carrito es:", carrito)
      
      // Guardar el carrito actualizado en localStorage
      localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito))
      
      // Actualizar la visualización del carrito
      mostrarCarrito()
      costeTotal()
    });
  });
}

// Ejecutar la función cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  // Cargar los datos primero
  cargarMueblesStock()
  
  // Verificar qué elementos existen en la página actual
  const tieneProductList = document.getElementById('productList') !== null
  const tieneCartList = document.getElementById('cartList') !== null
  const tieneStockList = document.getElementById('stockList') !== null
  
  console.log("Elementos detectados en la página:", {
    productList: tieneProductList,
    cartList: tieneCartList,
    stockList: tieneStockList
  })
  
  // Ejecutar solo las funciones para los elementos que existen
  if (tieneProductList) {
    mostrarMuebles()
  }
  
  if (tieneCartList) {
    mostrarCarrito()
    costeTotal()
  }
  
  if (tieneStockList) {
    mostrarMueblesInventario()
  }
})


// Al cargar la página, configurar el formulario para añadir productos
// Al cargar la página, configurar el formulario para añadir productos
document.addEventListener('DOMContentLoaded', function() {
  // Verificar si estamos en la página de inventario
  const tieneStockList = document.getElementById('stockList') !== null;
  
  if (tieneStockList) {
    // IMPORTANTE: Inicializar los controles de la modal
    inicializarControles();
    
    // Inicializar la funcionalidad de edición después de mostrar los productos
    mostrarMueblesInventario();
    editarProductosStock();
    
    // Asegurarse de que el formulario está configurado para agregar productos por defecto
    configurarFormularioParaAgregar();
  }
});

