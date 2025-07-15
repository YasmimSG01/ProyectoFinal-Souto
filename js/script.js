let libros = []; // Array que almacena todos los libros registrados
let libroActual = null; // Índice del libro que se está por marcar como leído
let libroEditando = null; // Índice del libro que se está editando

// Elementos del DOM
const formLibro = document.getElementById('form-libro');
const modalLeido = document.getElementById('marcar-leido-modal');
const listaNoLeidos = document.getElementById('no-leidos');
const listaLeidos = document.getElementById('leidos');
const btnConfirmar = document.getElementById('btn-confirmar-leido');
const btnCancelar = document.getElementById('btn-cancelar');
const contadorNoLeidos = document.getElementById('contador-no-leidos');
const contadorLeidos = document.getElementById('contador-leidos');
const btnSubmit = document.getElementById('btn-submit');
const btnCancelarEdicion = document.getElementById('btn-cancelar-edicion');

// Cargar los datos guardados en localStorage
function cargarDatos() {
    const datos = localStorage.getItem('libros');
    if (datos) libros = JSON.parse(datos);
    actualizarListas();
}

// Esta funcion guarda el array que contiene a los libros en local storage
function guardarDatos() {
    localStorage.setItem('libros', JSON.stringify(libros));
    actualizarContadores();
}

//Funcion que actualiza la lista de los libros leidos y no leidos
function actualizarListas() {
    // Limpia las listas
    while (listaNoLeidos.firstChild) {
        listaNoLeidos.removeChild(listaNoLeidos.firstChild);
    }
    while (listaLeidos.firstChild) {
        listaLeidos.removeChild(listaLeidos.firstChild);
    }
    
    // Agrega libros a las listas correspondientes
    libros.forEach((libro, index) => {
        const elementoLibro = crearElementoLibro(libro, index);
        
        if (libro.leido) {
            listaLeidos.appendChild(elementoLibro);
        } else {
            listaNoLeidos.appendChild(elementoLibro);
        }
    });
    
    // Actualizar contadores
    actualizarContadores();
}

// Función para manejar eventos mediante delegacion
function manejarEventos(e) {
    const boton = e.target.closest('button');
    if (!boton) return;
    
    const libroDiv = e.target.closest('.libro');
    const index = parseInt(libroDiv.dataset.index);
    
    if (boton.classList.contains('btn-marcar-leido')) {
        mostrarFormLeido(index);
    } else if (boton.classList.contains('btn-marcar-no-leido')) {
        marcarNoLeido(index);
    } else if (boton.classList.contains('btn-editar')) {
        editarLibro(index);
    } else if (boton.classList.contains('btn-eliminar')) {
        eliminarLibro(index);
    }
}

//Funcion para crear el elemento libro
function crearElementoLibro(libro, index) {
    const div = document.createElement('div');
    div.className = `libro ${libro.leido ? 'leido' : ''}`;
    div.dataset.index = index;

    // Función auxiliar para crear elementos con clases y contenido
    const crearElemento = (tag, className, contenido) => {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (contenido) el.textContent = contenido;
        return el;
    };

    // Función auxiliar para crear campos de texto con etiqueta
    const crearCampo = (etiqueta, valor) => {
        if (!valor) return null;
        const p = document.createElement('p');
        p.innerHTML = `<strong>${etiqueta}</strong>${valor}`;
        return p;
    };

    // Cabezal
    const header = document.createElement('div');
    header.className = 'libro-header';

    const infoDiv = document.createElement('div');
    infoDiv.append(
        crearElemento('h3', '', libro.titulo),
        crearCampo('Autor: ', libro.autor)
    );

    const estado = crearElemento('div', `estado-${libro.leido ? 'leido' : 'no-leido'}`, libro.leido ? 'Leído' : 'Por leer');
    header.append(infoDiv, estado);
    div.append(header);

    // Campos opcionales
    const campos = [
        { etiqueta: 'Editorial: ', valor: libro.editorial },
        { etiqueta: 'Edición: ', valor: libro.edicion },
        { etiqueta: 'Año: ', valor: libro.anio },
        { etiqueta: 'Idioma: ', valor: libro.idioma }
    ];

    campos.forEach(campo => {
        const elemento = crearCampo(campo.etiqueta, campo.valor);
        if (elemento) div.append(elemento);
    });

    // Pide agregar una reseña si el libro se marca como leido.
    if (libro.leido) {
        const notaResenia = crearElemento('div', 'nota-resenia');
        notaResenia.append(
            crearCampo('Nota: ', `${libro.nota}/10`),
            crearCampo('Reseña: ', libro.resenia)
        );
        div.append(notaResenia);
    }

    // Botones de acción
    const acciones = crearElemento('div', 'botones-accion');

    // Botón de leido o no
    const btnEstado = libro.leido
        ? crearElemento('button', 'btn-marcar-no-leido', ' Marcar como no leído')
        : crearElemento('button', 'btn-marcar-leido', ' Marcar como leído');
    
    btnEstado.prepend(crearElemento('i', `fas fa-${libro.leido ? 'undo' : 'check'}`));
    acciones.append(btnEstado);

    // Botones editar y eliminar
    ['editar', 'eliminar'].forEach(accion => {
        const boton = crearElemento('button', `btn-${accion}`, ` ${accion.charAt(0).toUpperCase() + accion.slice(1)}`);
        boton.prepend(crearElemento('i', `fas fa-${accion === 'editar' ? 'edit' : 'trash'}`));
        acciones.append(boton);
    });

    div.append(acciones);
    return div;
}

//Funcion para actualizar la cantidad de libros leidos y libros no leidos
function actualizarContadores() {
    const noLeidos = libros.filter(libro => !libro.leido).length;
    const leidos = libros.filter(libro => libro.leido).length;
    
    contadorNoLeidos.textContent = `(${noLeidos})`;
    contadorLeidos.textContent = `(${leidos})`;
}

// Evento para agregar un libro o editar
formLibro.addEventListener('submit', function(e) {
    e.preventDefault();
    
    //Obtenems los elementos ingresados en el formulario
    const titulo = document.getElementById('titulo').value.trim();
    const autor = document.getElementById('autor').value.trim();
    const editorial = document.getElementById('editorial').value.trim();
    const edicion = document.getElementById('edicion').value.trim();
    const anioInput = document.getElementById('anio');
    const anio = anioInput.value ? parseInt(anioInput.value) : null;
    const idioma = document.getElementById('idioma').value.trim();
    
    // Validamos si el año es valido o no 
    if (anioInput.value) {
        if (isNaN(anio)) {
            Swal.fire('Error', 'El año no es válido debes cambiarlo', 'error');
            return;
        }
        
        const añoActual = new Date().getFullYear();
        if (anio < 1000 || anio > añoActual) {
            Swal.fire('Error', `El año debe estar entre 1000 y ${añoActual}`, 'error');
            return;
        }
    }
    
    // Validamos los campos que son obligatorios de insertar
    if (!titulo || !autor) {
        Swal.fire('Error', 'Debe Ingresar Titulo y Autor del libo', 'error');
        return;
    }
    
    // Esto verifica si el libro ya existe o no, para evitar ingresar dos veces el mismo libro
    const existeLibro = libros.some((libro, i) => {
        if (btnSubmit.dataset.modo === "editar" && i === libroEditando) {
            return false; // Ignorar el libro actual durante la edición
        }
        
        // Comparacion para ignorar mayusculas o minsuctulas
        const tituloNormalizado = titulo.toLowerCase().replace(/\s+/g, ' ');
        const autorNormalizado = autor.toLowerCase().replace(/\s+/g, ' ');
        
        const libroTituloNormalizado = libro.titulo.toLowerCase().replace(/\s+/g, ' ');
        const libroAutorNormalizado = libro.autor.toLowerCase().replace(/\s+/g, ' ');
        
        return libroTituloNormalizado === tituloNormalizado && 
               libroAutorNormalizado === autorNormalizado;
    });
    
    //Muestra una alerta isi el libro ya existe y da la opción de editarlo luego
    if (existeLibro) {
        Swal.fire('Error', 'Este libro ya existe, no puedes agregarlo dos veces', 'error');
        return;
    }
    
    if (btnSubmit.dataset.modo === "editar") {
        // Modo edición: para editar un libro que ya existe
        libros[libroEditando] = {
            ...libros[libroEditando],
            titulo,
            autor,
            editorial: editorial || null,
            edicion: edicion || null,
            anio: anio || null,
            idioma: idioma || null
        };
        
        // Restaurar botón a "Agregar Libro"
        btnSubmit.textContent = "Agregar Libro";
        btnSubmit.dataset.modo = "";
        libroEditando = null;
        btnCancelarEdicion.style.display = 'none';
    } else {
        // Modo agregar: cuando el libro no exsite vamos a crear un libro nuevo
        const libro = {
            titulo,
            autor,
            editorial: editorial || null,
            edicion: edicion || null,
            anio: anio || null,
            idioma: idioma || null,
            leido: false
        };
        
        libros.push(libro);
    }
    
    guardarDatos();
    actualizarListas();
    formLibro.reset();
});

// Función para editar un libro
function editarLibro(index) {
    const libro = libros[index];
    
    // Recibimos los elementos ingresados en el formulario
    document.getElementById('titulo').value = libro.titulo;
    document.getElementById('autor').value = libro.autor;
    document.getElementById('editorial').value = libro.editorial || '';
    document.getElementById('edicion').value = libro.edicion || '';
    document.getElementById('anio').value = libro.anio || '';
    document.getElementById('idioma').value = libro.idioma || '';
    
    // Cambiar botón a "Actualizar"
    btnSubmit.textContent = "Actualizar Libro";
    btnSubmit.dataset.modo = "editar";
    
    // Guardar el índice del libro que estamos editando
    libroEditando = index;
    
    // Mostrar botón de cancelar edición
    btnCancelarEdicion.style.display = 'inline-block';
    
    // Desplazar al formulario para mejor experiencia de usuario
    formLibro.scrollIntoView({ behavior: 'smooth' });
}

// Cancelar edición
btnCancelarEdicion.addEventListener('click', function() {
    libroEditando = null;
    btnSubmit.textContent = 'Agregar Libro';
    btnCancelarEdicion.style.display = 'none';
    formLibro.reset();
});

// Esta funcion muestra el formulario para cambiar el libro a la lista de libros leidos
function mostrarFormLeido(index) {
    libroActual = index;
    modalLeido.style.display = 'block';
    document.getElementById('nota').value = '';
    document.getElementById('reseña').value = '';
}

//Este evento nos permite confirmar que realmente se quiere marcar como leido
btnConfirmar.addEventListener('click', function() {
    const nota = parseInt(document.getElementById('nota').value);
    const resenia = document.getElementById('reseña').value;
    
    // Validar que la nota esté en el rango de 1 a 10
    if (isNaN(nota) || nota < 1 || nota > 10) {
        Swal.fire('Error', 'Nota INVALIDA por favor, ingresa una nota válida entre 1 y 10', 'error');
        return;
    }
    
    libros[libroActual].leido = true;
    libros[libroActual].nota = nota;
    libros[libroActual].resenia = resenia || "Sin reseña";
    
    guardarDatos();
    actualizarListas();
    modalLeido.style.display = 'none';
});

// Cancelar marcado como leído
btnCancelar.addEventListener('click', function() {
    modalLeido.style.display = 'none';
});

// Funcion para regresar libro a la lista de no leidos
function marcarNoLeido(index) {
    libros[index].leido = false;
    delete libros[index].nota;
    delete libros[index].resenia;
    guardarDatos();
    actualizarListas();
}

// Funcion para eliminar un libro
function eliminarLibro(index) {
    Swal.fire({
        title: '¿Estás seguro que quieres eliminar este libro?',
        text: "¡No puedes recuperarlo!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            libros.splice(index, 1);
            guardarDatos();
            actualizarListas();
            Swal.fire(
                'Eliminado!',
                'El libro ha sido eliminado de tu biblioteca.',
                'success'
            );
        }
    });
}

// Iniciar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Agregar event listeners a las listas
    listaNoLeidos.addEventListener('click', manejarEventos);
    listaLeidos.addEventListener('click', manejarEventos);
    
    // Cargar datos almacenados
    cargarDatos();
});