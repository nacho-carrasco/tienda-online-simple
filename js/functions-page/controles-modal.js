/********************** 
 ** GESTOR DE STOCK **
***********************/
// functions-page/controles-modal.js
import { MUEBLES_KEY } from "../BBDD/BBDD.js";
import { muebles, cargarMueblesStock, mostrarMuebles } from "../app.js"

// Declaración de variables para elementos DOM
export let openModalBtn;
export let overlay;
export let overlayDelete; // Nueva variable para la modal de eliminación
export let closeModalBtn;
export let cancelModalBtn;
export let formulario;

// Variables específicas para la modal de eliminación
let closeModalDeleteBtn;
let cancelModalDeleteBtn;
let confirmDeleteBtn;
let currentProductToDelete = null; // Variable para almacenar el ID del producto a eliminar

// Función para inicializar todos los elementos DOM y eventos
export function inicializarControles() {
  // Inicializar referencias a elementos DOM
  openModalBtn = document.getElementById('crearProductoModal')
  overlay = document.getElementById('maskOverlay')
  overlayDelete = document.getElementById('maskOverlayDelete') // Corregir el typo
  closeModalBtn = document.getElementById('closeModal')
  cancelModalBtn = document.getElementById('cancelModal')
  formulario = document.getElementById('productoForm')

  // Referencias específicas para la modal de eliminación
  // Usar los IDs correctos para los botones de la modal de eliminación
  closeModalDeleteBtn = document.getElementById('closeModalDelete')
  cancelModalDeleteBtn = document.getElementById('cancelModalDelete')
  confirmDeleteBtn = document.getElementById('btnDeleteConfirm')

  // Verificar si los elementos existen antes de agregar event listeners
  if (openModalBtn) {
    openModalBtn.addEventListener('click', function() {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  // Event listeners para la modal principal (crear/editar productos)
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }
  if (cancelModalBtn) {
    cancelModalBtn.addEventListener('click', closeModal);
  }
  if (overlay) {
    // Cerrar el modal al hacer clic en el overlay (fuera de la modal)
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        closeModal();
      }
    });
  }

  // Event listeners para la modal de eliminación
  if (closeModalDeleteBtn) {
    closeModalDeleteBtn.addEventListener('click', closeDeleteModal);
  }
  if (cancelModalDeleteBtn) {
    cancelModalDeleteBtn.addEventListener('click', closeDeleteModal);
  }
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', confirmDelete);
  }
  if (overlayDelete) {
    // Cerrar la modal de eliminación al hacer clic en el overlay
    overlayDelete.addEventListener('click', function(e) {
      if (e.target === overlayDelete) {
        closeDeleteModal();
      }
    });
  }

  // Cerrar las modales con la tecla ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      // Cerrar modal principal si está activa
      if (overlay && overlay.classList.contains('active')) {
        closeModal();
      }
      // Cerrar modal de eliminación si está activa
      if (overlayDelete && overlayDelete.classList.contains('active')) {
        closeDeleteModal();
      }
    }
  });

  // Generar un ID para el nuevo producto al cargar la modal
  const muebles = JSON.parse(localStorage.getItem(MUEBLES_KEY)) || [];
  const idField = document.getElementById('id-field');
  if (idField) {
    idField.value = muebles.length + 1;
    console.log("El array de objetos muebles tiene de longitud: ", muebles.length);
  }

  // Mostrar vista previa de la imagen
  const imagenInput = document.getElementById('imagen');
  if (imagenInput) {
    imagenInput.addEventListener('input', function() {
      const url = "../assets/images/" + document.getElementById('imagen').value;
      const previewImg = document.getElementById('previewImg');
      
      if (url) {
        previewImg.src = url;
        previewImg.style.display = 'block';
        
        // Ocultar la imagen si no se puede cargar
        previewImg.onerror = function() {
          this.style.display = 'none';
        };
      } else {
        previewImg.style.display = 'none';
      }
    });
  }

  // Configurar el comportamiento del botón de envío del formulario
  const formSubmitBtn = document.getElementById('formNuevoProductoSubmit');
  if (formSubmitBtn) {
    configurarFormularioParaAgregar();
  }
}

export function mostrarMueblesInventario() {
  const muebles = cargarMueblesStock();
  console.log('Variable muebles desde dentro de la funcion mostrar muebles inventario / stock es: ', muebles);
  const contenedorMueblesStock = document.getElementById('stockList'); //Contenedor de la lista productos
  
  // Si no hay contenedor o no hay muebles, salimos de la función
  if (!contenedorMueblesStock) {
    console.error('No se encontró el contenedor del inventario (stockList)');
    return;
  }
  
  console.log('Contenedor stockList encontrado:', contenedorMueblesStock);
  
  if (!muebles || !muebles.length) {
    console.error('No hay muebles guardados en el inventario');
    contenedorMueblesStock.innerHTML = '<p style="color:peru;">No hay productos en el inventario</p>';
    return;
  }
  
  console.log('Mostrando', muebles.length, 'productos en el inventario');
  
  // Limpiar el contenedor antes de añadir nuevos elementos
  contenedorMueblesStock.innerHTML = '';
  
  // Recorrer cada mueble y crear su tarjeta
  muebles.forEach(mueble => {
    // Crear la estructura HTML para cada mueble
    const muebleHTML = `
    <article class="stock-product-card">
      <figure class="stock-product-card--image">
          <img src="../assets/images/${mueble.img}" alt="${mueble.nombre}">
      </figure>
      <div class="stock-product-car--info-container">
          <div class="stock-product-car--data-container">
              <h3 class="product-card--name">${mueble.nombre}</h3>
              <p class="product-card--description">Dimensiones: ${mueble.dimensiones}</p>
              <p class="product-card--price">${mueble.precio.toFixed(2)}€</p>
          </div>
          <div class="stock-product-card--buttons-container">
              <button class="btn-neutral btn-edit" data-id="${mueble.id}">
                  <span class="material-symbols-outlined">edit</span> 
                  Editar producto
              </button>
              <button class="btn-delete" data-id="${mueble.id}">
                  <span class="material-symbols-outlined">delete</span> 
                  Eliminar producto
              </button>
          </div>
      </div>
    </article>
    `;
    // Añadir el HTML al contenedor
    contenedorMueblesStock.innerHTML += muebleHTML;
    console.log(`Añadido mueble ${mueble.id} - ${mueble.nombre} al inventario`);
  });
  
  // Añadir event listeners a los botones después de crear las tarjetas
  eliminarProductosStock();
  // Llama a editarProductosStock cada vez que se actualiza la lista
  editarProductosStock();
} //Fin mostrar lista de productos

/**** FUNCIONES PARA LA MODAL DE ELIMINACIÓN ****/

// Función para abrir la modal de confirmación de eliminación
export function openDeleteModal(productId, productName) {
  // Guardamos el ID del producto que queremos eliminar
  currentProductToDelete = productId;
  
  // Actualizamos el mensaje de confirmación con el nombre del producto
  const messageElement = overlayDelete.querySelector('.modal-message');
  if (messageElement) {
    messageElement.innerHTML = `¿Estás seguro de que quieres eliminar el producto <strong>"${productName}"</strong> del stock?`;
  }
  
  // Mostramos la modal
  if (overlayDelete) {
    overlayDelete.classList.add('active');
    document.body.style.overflow = 'hidden'; // Evitar scroll en el fondo
  }
  
  console.log(`Modal de eliminación abierta para producto ID: ${productId}, Nombre: ${productName}`);
}

// Función para cerrar la modal de eliminación
export function closeDeleteModal() {
  if (overlayDelete) {
    overlayDelete.classList.remove('active');
    document.body.style.overflow = 'auto'; // Restaurar scroll
  }
  
  // Limpiar la variable temporal
  currentProductToDelete = null;
  
  console.log('Modal de eliminación cerrada');
}

// Función para confirmar y ejecutar la eliminación
export function confirmDelete() {
  // Verificar que tenemos un producto para eliminar
  if (currentProductToDelete === null) {
    console.error('No hay producto seleccionado para eliminar');
    return;
  }
  
  console.log(`Confirmando eliminación del producto con ID: ${currentProductToDelete}`);
  
  // Obtener los muebles del localStorage
  let muebles = JSON.parse(localStorage.getItem(MUEBLES_KEY)) || [];
  
  // Encontrar el producto antes de eliminarlo (para el log)
  const productoAEliminar = muebles.find(mueble => mueble.id === currentProductToDelete);
  
  // Filtrar el array para eliminar el producto con el ID seleccionado
  muebles = muebles.filter(mueble => mueble.id !== currentProductToDelete);
  
  // Guardar el array actualizado en localStorage
  localStorage.setItem(MUEBLES_KEY, JSON.stringify(muebles));
  
  // Mostrar mensaje de confirmación al usuario
  if (productoAEliminar) {
    alert(`Producto "${productoAEliminar.nombre}" eliminado correctamente del stock.`);
    console.log(`Producto eliminado:`, productoAEliminar);
  }
  
  // Actualizar la visualización del inventario
  mostrarMueblesInventario();
  
  // Cerrar la modal
  closeDeleteModal();
}

/**** ELIMINAR PRODUCTOS DEL INVENTARIO / STOCK - MODIFICADO */
// Función para manejar los eventos de los botones "Eliminar Producto"
export function eliminarProductosStock() {
  const botonesEliminar = document.querySelectorAll('.btn-delete')
  
  botonesEliminar.forEach(boton => {
    // Eliminamos cualquier event listener previo para evitar duplicados
    boton.removeEventListener('click', handleDeleteClick)
    // Añadimos el nuevo event listener
    boton.addEventListener('click', handleDeleteClick)
  })
}

// Función manejadora para el evento click del botón eliminar - MODIFICADA
export function handleDeleteClick() {
  // Obtener el ID del producto desde el atributo del botón
  const muebleId = parseInt(this.getAttribute('data-id'))
  console.log(`Solicitud de eliminación para producto con ID ${muebleId}`)
  
  // Obtener los muebles del localStorage para encontrar el nombre del producto
  const muebles = JSON.parse(localStorage.getItem(MUEBLES_KEY)) || []
  const producto = muebles.find(mueble => mueble.id === muebleId)
  
  if (producto) {
    // Abrir la modal de confirmación con los datos del producto
    openDeleteModal(muebleId, producto.nombre)
  } else {
    console.error(`No se encontró producto con ID ${muebleId}`)
    alert('Error: No se encontró el producto a eliminar')
  }
}

export function resetFormulario() {
  if (!formulario) return;
  
  formulario.reset();
  const previewImg = document.getElementById('previewImg');
  if (previewImg) {
    previewImg.style.display = 'none';
  }
  updateID();
  
  function updateID() {
    // Obtener muebles actualizados del localStorage
    let muebles = JSON.parse(localStorage.getItem(MUEBLES_KEY));
    let maxId = 0;
    
    if (muebles && muebles.length > 0) {
      maxId = Math.max(...muebles.map(m => parseInt(m.id)));
    }
    
    const idField = document.getElementById('id-field');
    if (idField) {
      idField.value = maxId + 1;
    }
  }
}

// Función para cerrar la modal que resetea el comportamiento del formulario
export function closeModal() {
  if (!overlay) return;
  
  overlay.classList.remove('active');
  document.body.style.overflow = 'auto'; // Restaura el scroll en la página
  
  // Resetear el formulario
  resetFormulario();
  
  // Asegurarse de que el formulario vuelve a su estado original para añadir productos
  const botonSubmit = document.getElementById('formNuevoProductoSubmit');
  if (botonSubmit) {
    botonSubmit.textContent = 'Guardar Producto';
    configurarFormularioParaAgregar();
  }
}

/**** EDITAR PRODUCTOS STOCK ****/
// Función para manejar la edición de productos
export function editarProductosStock() {
  // Seleccionar todos los botones de editar
  const botonesEditar = document.querySelectorAll(".btn-edit");
  
  // Añadir evento click a cada botón de editar
  botonesEditar.forEach(boton => {
    // Eliminamos cualquier event listener previo
    boton.replaceWith(boton.cloneNode(true));
    
    // Obtenemos la referencia al nuevo botón
    const nuevoBoton = document.querySelector(`.btn-edit[data-id="${boton.getAttribute('data-id')}"]`);
    
    // Añadimos el nuevo event listener
    nuevoBoton.addEventListener('click', function() {
      // Obtener el ID del producto desde el atributo data-id del botón
      const muebleId = parseInt(this.getAttribute('data-id'));
      console.log(`Preparando para editar producto con ID ${muebleId}`);
      
      // Buscar el producto en el array de muebles
      let muebles = JSON.parse(localStorage.getItem(MUEBLES_KEY));
      const muebleAEditar = muebles.find(mueble => mueble.id === muebleId);
      
      if (muebleAEditar) {
        console.log("Producto encontrado para editar:", muebleAEditar);
        
        // Abrir el modal
        if (overlay) {
          overlay.classList.add('active');
          document.body.style.overflow = 'hidden'; // Evita el scroll en la página
        }
        
        // Llenar el formulario con los datos del producto
        const idField = document.getElementById('id-field');
        const imagenField = document.getElementById('imagen');
        const nombreField = document.getElementById('nombre');
        const dimensionesField = document.getElementById('dimensiones');
        const precioField = document.getElementById('precio');
        
        if (idField) idField.value = muebleAEditar.id;
        if (imagenField) imagenField.value = muebleAEditar.img;
        if (nombreField) nombreField.value = muebleAEditar.nombre;
        if (dimensionesField) dimensionesField.value = muebleAEditar.dimensiones;
        if (precioField) precioField.value = muebleAEditar.precio;
        
        // Actualizar la vista previa de la imagen
        const previewImg = document.getElementById('previewImg');
        if (previewImg) {
          previewImg.src = "../assets/images/" + muebleAEditar.img;
          previewImg.style.display = 'block';
          
          // Manejar error de carga de imagen
          previewImg.onerror = function() {
            this.style.display = 'none';
          };
        }
        
        // Modificar el comportamiento del formulario para actualizar en lugar de crear
        configurarFormularioParaEdicion(muebleId);
      } else {
        console.error(`No se encontró producto con ID ${muebleId}`);
      }
    });
  });
}

// Función para configurar el formulario en modo edición
export function configurarFormularioParaEdicion(muebleId) {
  // Cambiar el texto del botón de envío
  const botonSubmit = document.getElementById('formNuevoProductoSubmit');
  if (botonSubmit) {
    // Cambiamos el texto del botón
    botonSubmit.textContent = 'Actualizar Producto';
    
    // Eliminamos todos los event listeners previos clonando y reemplazando el botón
    const nuevoBoton = botonSubmit.cloneNode(true);
    botonSubmit.parentNode.replaceChild(nuevoBoton, botonSubmit);
    
    // Agregamos el evento para actualizar el producto
    nuevoBoton.addEventListener('click', function(e) {
      e.preventDefault();
      
      console.log("Actualizando producto con ID:", muebleId);
      
      // Obtener valores actualizados del formulario
      const img = document.getElementById('imagen').value;
      const nombre = document.getElementById('nombre').value;
      const dimensiones = document.getElementById('dimensiones').value;
      const precio = parseFloat(document.getElementById('precio').value);
      
      // Validación de campos obligatorios
      if (!nombre) {
        alert('Por favor, ingresa un nombre de producto');
        return;
      }
      if (!dimensiones) {
        alert('Por favor, ingresa las dimensiones');
        return;
      }
      if (isNaN(precio) || precio <= 0) {
        alert('Por favor, ingresa un precio válido');
        return;
      }
      
      // Obtener muebles actualizados del localStorage
      let muebles = JSON.parse(localStorage.getItem(MUEBLES_KEY));
      
      // Encontrar el índice del mueble a actualizar
      const indice = muebles.findIndex(mueble => mueble.id === muebleId);
      
      console.log("Indice del producto a actualizar:", indice);
      
      if (indice !== -1) {
        // Mantener la imagen anterior si no se proporciona una nueva
        const imagenFinal = img || muebles[indice].img;
        
        // Actualizar el objeto del mueble con los nuevos valores, manteniendo el mismo ID
        muebles[indice] = {
          id: muebleId, // Importante: mantener el mismo ID
          img: imagenFinal,
          nombre: nombre,
          dimensiones: dimensiones,
          precio: precio
        };
        
        // Guardar en localStorage
        localStorage.setItem(MUEBLES_KEY, JSON.stringify(muebles));
        
        // Informar al usuario
        alert('Producto actualizado correctamente');
        console.log('Mueble actualizado:', muebles[indice]);
        
        // Actualizar la visualización del inventario
        mostrarMueblesInventario();
        
        // Cerrar el modal
        closeModal();
      } else {
        alert('Error: No se encontró el producto a actualizar');
      }
    });
  }
}

// Función para configurar el formulario para agregar nuevos productos
export function configurarFormularioParaAgregar() {
  const botonSubmit = document.getElementById('formNuevoProductoSubmit');
  if (botonSubmit) {
    // Cambiar el texto del botón
    botonSubmit.textContent = 'Guardar Producto';
    
    // Eliminamos todos los event listeners previos clonando y reemplazando el botón
    const nuevoBoton = botonSubmit.cloneNode(true);
    botonSubmit.parentNode.replaceChild(nuevoBoton, botonSubmit);
    
    // Agregamos el evento para crear nuevo producto
    nuevoBoton.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Obtener valores del formulario
      const img = document.getElementById('imagen').value;
      const nombre = document.getElementById('nombre').value;
      const dimensiones = document.getElementById('dimensiones').value;
      const precio = parseFloat(document.getElementById('precio').value);
      
      // Validación mejorada - comprobamos cada campo individualmente
      if (!img) {
        alert('Por favor, ingresa un nombre de imagen');
        return;
      }
      if (!nombre) {
        alert('Por favor, ingresa un nombre de producto');
        return;
      }
      if (!dimensiones) {
        alert('Por favor, ingresa las dimensiones');
        return;
      }
      if (isNaN(precio) || precio <= 0) {
        alert('Por favor, ingresa un precio válido');
        return;
      }
      
      // Obtener muebles actualizados del localStorage
      let muebles = JSON.parse(localStorage.getItem(MUEBLES_KEY));
      
      // Determinar el próximo ID (el máximo existente + 1)
      let maxId = 0;
      if (muebles && muebles.length > 0) {
        maxId = Math.max(...muebles.map(m => parseInt(m.id)));
      }
      const newId = maxId + 1;
      
      // Crear objeto del nuevo mueble con ID calculado
      const nuevoMueble = {
        id: newId,
        img: img,
        nombre: nombre,
        dimensiones: dimensiones,
        precio: precio
      };
      
      // Agregar el nuevo mueble al array
      muebles.push(nuevoMueble);
      
      // Guardar en LocalStorage
      localStorage.setItem(MUEBLES_KEY, JSON.stringify(muebles));
      
      // Informar al usuario
      alert('Mueble guardado correctamente');
      console.log('Muebles actualizados:', muebles);
      
      // Resetear el formulario y prepararlo para un nuevo mueble
      resetFormulario();
      
      // Actualizar la visualización del inventario
      mostrarMueblesInventario();
      
      // Cerrar el modal
      closeModal();
    });
  }
}