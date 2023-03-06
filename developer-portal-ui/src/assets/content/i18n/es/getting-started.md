<div class="divider">
</div>

# Empezando

[La Directiva de Servicios de Pago 2](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32015L2366&from=EN) (PSD2) instruye a los bancos (Proveedores de Servicios de Pago de Servicio de Cuentas o ASPSP) para que proporcionen una interfaz de Acceso a la Cuenta (XS2A) completamente productiva a Terceros Proveedores (TPP) hasta marzo de 2020. El propio XS2A consiste en servicios bancarios para iniciar pagos (PIS), solicitar datos de cuenta (AIS) y obtener la confirmación de la disponibilidad de fondos (PIIS). Para garantizar el cumplimiento de este plazo debido a las adaptaciones y los errores, PSD2 reclama a los bancos que proporcionen un ModelBank y funcional que ofrece los servicios XS2A en un entorno no productivo hasta junio de 2019.

El **ModelBank** es un entorno de entorno de pruebas dinámico que cumple completamente los requisitos de PSD2 para proporcionar API a Terceros Proveedores(TPP). Basado en la especificación NextGen PSD2 del Grupo de Berlín para el acceso a cuentas (XS2A),

Este portal de desarrolladores se crea para ayudar a los desarrolladores de TPP a comenzar a trabajar con ModelBank.

<div class="divider">
</div>

# Arquitectura y módulos de ModelBank

Los componentes de ModelBank con sus conexiones entre sí se muestran en la Figura 1.1.

![Figure 1.1](../../assets/images/Graphic_XS2A_Sandbox.jpg)

Figura 1.1: Componentes de la ModelBank

<div class="divider">
</div>

# Interfaz XS2A

El componente central de **ModelBank** es la interfaz XS2A que cumple con los requisitos del Grupo de Berlín [NextGenPSD2](https://www.berlin-group.org/psd2-access-to-bank-accounts) (versión 1.3) y se basa en datos de prueba. Puede visitar nuestra interfaz de usuario [XS2A Swagger UI](https://demo-dynamicsandbox-xs2a.cloud.adorsys.de/) o encontrar la interfaz completa de [OpenSource XS2A en Github](https://github.com/adorsys/xs2a).

<div class="divider">
</div>

# Perfil ASPSP

Además de la interfaz real, PSD2 instruye a los ASPSP para que ofrezcan una documentación técnica gratuita que contenga, entre otros, información sobre productos de pago admitidos y servicios de pago. Esta información se almacena en **ASPSP-profile** (perfil de banco), un servicio basado en el archivo yaml donde un banco puede proporcionar productos de pago, servicios de pago, enfoques SCA compatibles y otras configuraciones específicas del banco.

<div class="divider">
</div>

# Servicio de Certificación TPP

Generalmente, antes de acceder a los servicios XS2A, un TPP tendría que registrarse en su Autoridad Nacional Competente (NCA) y solicitar un certificado [eIDAS](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32014R0910&from=EN) en un Proveedor de Servicios de Fideicomiso (TSP) apropiado. Sería demasiado esfuerzo emitir un certificado real solo para fines de prueba, por lo que **ModelBank** simula además un TSP ficticio que emite Certificados de autenticación de sitios web calificados (QWAC). Un QWAC es parte de eIDAS y podría ser mejor conocido como certificado [X.509](https://www.ietf.org/rfc/rfc3739.txt) Para propósitos de PSD2, el certificado se extiende por QcStatement que contiene los valores apropiados, como los roles del PSP (consulte [ETSI](https://www.etsi.org/deliver/etsi_ts/119400_119499/119495/01.01.02_60/ts_119495v010102p.pdf)).

Después de incrustar el QWAC en la solicitud XS2A real, el rol y la firma se validan en un proxy central inverso antes de pasar finalmente a la interfaz donde tiene lugar la lógica bancaria.

<div class="divider">
</div>

# Interfaz de usuario TPP

Los desarrolladores de TPP pueden registrarse en el sistema, obtener un certificado descargar datos de prueba para su aplicación TPP utilizando el certificado generado y los datos preparados en la interfaz de usuario de TPP.

## Cómo crear una cuenta para TPP?

1. Abra la página de inicio de sesión de TPP UI

2. Elija la opción "Registrarse " a continuación.

3. Proporcione toda la información necesaria: número de autorización TPP, correo electrónico, nombre de usuario y contraseña.

4. Puede generar un certificado QWAC de prueba para usarlo con la interfaz XS2A si es necesario

## Cómo crear usuarios?

Los usuarios pueden crearse manualmente o cargando el archivo .yaml

### Para crear un usuario manualmente:

1. Vaya a "Mi lista de usuarios" y haga clic en "Crear nuevo usuario ".

2. Ingrese correo electrónico, inicio de sesión y pin para un nuevo usuario

3. Elija el método de autenticación (solo el correo electrónico es válido por ahora) e ingrese un correo electrónico válido. Si elige la opción " Usar TAN estático en ModelBank ", se usará un TAN estático falso para las pruebas. Entonces usted tiene para ingresar su TAN simulado también. Puede agregar múltiples métodos SCA a cada usuario

### Para crear cuentas manualmente:

1 Elija un usuario en su lista de usuarios y haga clic en "Crear cuenta de depósito".

2. Seleccione el tipo de cuenta, el uso y el estado de la cuenta. IBAN podría generarse automáticamente. Tenga en cuenta que la interfaz XS2A solo acepta ibans válidos

3. Una vez creada la cuenta, puede usar la función "Depositar efectivo " para agregar cualquier cantidad a los saldos con fines de prueba. Todas las cuentas creadas están disponibles en la pestaña "Cuentas de usuarios".

Para crear usuarios y cuentas automáticamente, genere datos de prueba con la pestaña "Generar datos de prueba", y se generarían datos de prueba compatibles con NISP. Si desea cargar su propio archivo de prueba .yaml, use la pestaña "Subir archivos" .

## Cómo crear pagos de prueba, consentimientos y transacciones:

Para crear pagos de prueba, debe generar datos de pago de prueba en la pestaña "Generar datos de prueba", marcando la opción "Generar datos de pago" como verdadero. Además, la carga de un archivo .yaml personalizado con los pagos son posibles en la pestaña "Subir archivos". Los consentimientos y las transacciones solo pueden crearse con la carga del archivo .yaml adecuado.

<div class="divider">
</div>

# Online Banking

En el caso de un enfoque de REDIRECT SCA, un usuario desea dar su consentimiento para utilizar la información de su cuenta o para confirmar / cancelar el pago. La banca en línea es una interfaz de usuario para proporcionar consentimiento a un banco. Los enlaces para la confirmación de consentimiento y la confirmación o cancelación de pago se proporcionan en la respuesta de los puntos finales correspondientes.

<div class="divider">
</div>

# Links to environments

| Service                   |                                                        Demo environment |
| ------------------------- | ----------------------------------------------------------------------: |
| XS2A Interface Swagger    |        <a href="#" id="XS2AInterfaceSwagger">XS2A Interface Swagger</a> |
| Developer portal          |                   <a href="#" id="developerPortal">Developer portal</a> |
| Consent management system | <a href="#" id="consentManagementSystem" >Consent management system</a> |
| Ledgers                   |                                   <a href="#" id="ledgers" >Ledgers</a> |
| ASPSP-Profile Swagger     |         <a href="#" id="ASPSPProfileSwagger" >ASPSP-Profile Swagger</a> |
| TPP User Interface        |               <a href="#" id="TPPUserInterface" >TPP User Interface</a> |
| Online banking UI         |                 <a href="#" id="onlineBankingUI" >Online banking UI</a> |
| Online banking backend    |       <a href="#" id="onlineBankingBackend" >Online banking backend</a> |
| Certificate Generator     |        <a href="#" id="certificateGenerator" >Certificate Generator</a> |

<div class="divider">
</div>

# Cómo descargar, configurar y ejecutar el proyecto

## Prerrequisitos

Este ModelBank se ejecuta con el docker-compose que se puede encontrar en docker-compose.yml y Makefile en el directorio del proyecto. Pero antes de ejecutar ModelBank, primero verifique si todas las dependencias de compilación están instaladas:

_make check_

Si falta algo, instálelo en su máquina local, de lo contrario la compilación fallará. Lista de dependencias que se requieren para usar ModelBank: Java 11, NodeJs, CLI angular, Asciidoctor, jq, Docker, Docker Compose, Maven, PlantUML. Aquí están los enlaces donde puede instalar las dependencias necesarias:

| Dependency          |                  Link                   |
| ------------------- | :-------------------------------------: |
| Java 11             |    https://openjdk.java.net/install/    |
| Node.js 12.x        |     https://nodejs.org/en/download      |
| Angular CLI 9.x     |   https://angular.io/guide/quickstart   |
| Asciidoctor 2.0     |         https://asciidoctor.org         |
| jq 1.6              | https://stedolan.github.io/jq/download  |
| Docker 1.17         |   https://www.docker.com/get-started    |
| Docker Compose 1.24 | https://docs.docker.com/compose/install |
| Maven 3.5           |  https://maven.apache.org/download.cgi  |
| PlantUML 1.2019.3   |     http://plantuml.com/en/starting     |

Puede eliminar todos los contenedores de ModelBank de Docker con el siguiente comando:

_docker-compose rm -s -f -v_

## Nota

Verifique la cantidad de memoria asignada a Docker (Abra Docker Desktop -> Preferencias -> Avanzado -> Memoria). Para un inicio rápido e indoloro de todos los servicios, no debe ser inferior a 5 GB.

## Descargar ModelBank

Descargue el proyecto directamente desde GitHub o use el comando:

_git clone https://github.com/adorsys/XS2A-Sandbox_

**Note:**
Siempre haz una extracción desde GitHub

## Construye y ejecuta ModelBank

Después de descargar el proyecto vaya al directorio del proyecto:

_cd XS2A-Sandbox_

Después de eso, puede construir y ejecutar ModelBank de dos maneras: con un comando docker o con comandos Makefile.

Si quieres, usa una primera manera:

1. Construye todos los servicios con el comando:

_make_

2. Después de edificio servicios, puede ejecutar ModelBank con un simple comando docker:

_docker-compose up_

En Makefile puede usar uno de los tres comandos:

• Ejecute servicios desde Docker Hub sin construir:

_make run_

• Construir, crea imágenes de Docker y ejecutar servicios:

_make all_

• Crea imágenes de Docker y ejecutar servicios sin construir:

_make start_

Una vez que hayas construido el proyecto puedes ejecutarlo sin construir la próxima vez - comando docker-compose up o make start desde Makefile.

Recuerde que después de actualizar el proyecto debe reconstruirlo - comando make o make all desde Makefile.

<div class="divider">
</div>

# Solución de problemas

Estos son errores comunes que puede obtener durante el inicio de ModelBank y una instrucción sobre cómo deshacerse de él:

## Error de lista de cambios de liquibase

Este error puede producirse si tuvo un inicio incorrecto de ModelBank anteriormente. Ejemplo de posible stack trace:

```yaml
ledgers | 2019-05-02 13:54:29.410 INFO 1 --- [ main] liquibase.executor.jvm.JdbcExecutor : SELECT LOCKED FROM ledgers.databasechangeloglock WHERE ID=1
ledgers | 2019-05-02 13:54:39.697 INFO 1 --- [ main] l.lockservice.StandardLockService : Waiting for changelog lock....
ledgers | 2019-05-02 13:54:55.137 INFO 1 --- [ main] liquibase.executor.jvm.JdbcExecutor : SELECT LOCKED FROM ledgers.databasechangeloglock WHERE ID=1
ledgers | 2019-05-02 13:55:35.940 INFO 1 --- [ main] l.lockservice.StandardLockService : Waiting for changelog lock....
ledgers | 2019-05-02 13:55:45.995 INFO 1 --- [ main] liquibase.executor.jvm.JdbcExecutor : SELECT LOCKED FROM ledgers.databasechangeloglock WHERE ID=1
ledgers | 2019-05-02 13:55:46.967 INFO 1 --- [ main] l.lockservice.StandardLockService : Waiting for changelog lock....
ledgers | 2019-05-02 13:55:59.167 INFO 1 --- [ main] liquibase.executor.jvm.JdbcExecutor : SELECT LOCKED FROM ledgers.databasechangeloglock WHERE ID=1
ledgers | 2019-05-02 13:57:38.705 INFO 1 --- [ main] l.lockservice.StandardLockService : Waiting for changelog lock....
ledgers exited with code 137
```

Solución posible:

Busque y elimine todas las carpetas "ledgerdbs" y "xs2adbs". Borrar todos los contenedores docker con el comando:

_docker-compose rm -s -f -v_

Reinicie todos los servicios.

## Error de versión del Node

Este error se puede producir debido a una versión incorrecta de NodeJs (versión superior a 11.x). Ejemplo de posible stack trace:

```yaml
gyp ERR! build error
gyp ERR! stack Error: `make` failed with exit code: 2
gyp ERR! stack at ChildProcess.onExit (/Users/rpo/XS2A-Sandbox/developer-portal-ui/node_modules/node-gyp/lib/build.js:262:23)
gyp ERR! stack at ChildProcess.emit (events.js:196:13)
gyp ERR! stack at Process.ChildProcess.\_handle.onexit (internal/child_process.js:256:12)
gyp ERR! System Darwin 17.7.0
gyp ERR! command "/usr/local/Cellar/node/12.1.0/bin/node" "/Users/rpo/XS2A-Sandbox/developer-portal-ui/node_modules/node-gyp/bin/node-gyp.js" "rebuild" "--verbose" "--libsass_ext=" "--libsass_cflags=" "--libsass_ldflags=" "--libsass_library="
gyp ERR! cwd /Users/rpo/XS2A-Sandbox/developer-portal-ui/node_modules/@angular-devkit/build-angular/node_modules/node-sass
gyp ERR! node -v v12.1.0
gyp ERR! node-gyp -v v3.8.0
gyp ERR! not ok
```

Solución posible:

Primero, verifique su versión de NodeJs con el comando:

_node -v_

Si la versión es superior a 11.x, cambie la versión de NodeJs a una anterior.

<div class="divider">
</div>

# Cómo registrar TPP y comenzar testing

1. Abra la página de inicio de sesión de la interfaz de usuario de TPP.
2. Si Usted no tiene nombre de usuario y contraseña, regístrese Usted mismo haciendo clic en el botón "Registrarse".
3. Regístrese, cree un certificado e inicie sesión en el sistema. Nota: la identificación de TPP debe constar de al menos 8 dígitos, no se permiten letras ni otros signos.
4. Sube los datos de prueba y comienza a probar.

El flujo completo para que los TPP comiencen su trabajo con ModelBank se muestra en la Figura 1.2:

![Figure 1.2](../../assets/images/Flow.png)

Figura 1.2: flujo de TPP paso a paso

<div class="divider">
</div>

# Cómo personalizar el portal de desarrolladores

Es posible personalizar textos, navegación, cantidad y contenido de páginas y estilo de todos los elementos del Portal del desarrollador. Para saber cómo hacerlo, lea [Guía de personalización](../../../../assets/files/UIs_customization_guide.pdf).

<div class="divider">
</div>

# Soporte de Google Analytics

Para conectar su cuenta de Google Analytics, en UITheme.json en la sección UI del Developer Portal, agregue la propiedad `googleAnalyticsTrackingId` con su ID de cuenta de Google Analytics. Luego ejecute la aplicación normalmente, la cuenta de Google Analytics se conectará automáticamente.

```json
{
  "globalSettings": {
    "googleAnalyticsTrackingId": "YOUR_TRACKING_ID"
  }
}
```

La aplicación proporciona a Google Analytics la información sobre cada visita a la página y algunos eventos. Estos eventos son cada prueba del punto final de API en la sección Casos de prueba (el evento se activa haciendo clic en el botón Enviar) y la descarga de pruebas de Postman (el evento se activa haciendo clic en el botón Descargar).

<div class="divider">
</div>

# ¿Que sigue?

Cuando haya terminado con todos los pasos del Manual de introducción consulte la sección Casos de prueba para realizar más pruebas. Allí encontrará las pruebas preparadas de Postman, la descripción de la interfaz de la interfaz XS2A y las instrucciones para probar ModelBank con Swagger.
