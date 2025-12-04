/**
 * factura service
 */

import { factories } from '@strapi/strapi';
import { CustomError } from '../../../utils/CustomError';

export default factories.createCoreService('api::factura.factura', ({ strapi }) => ({

  async createVenta(data) {
    return await strapi.db.transaction(async () => {

      // ==========================================================
      // 0️⃣ VALIDAR SUCURSAL
      // ==========================================================

       const sucursal = await strapi.db.query('api::sucursal.sucursal').findOne({
        where: { id: data.sucursal, activa: true },
        populate: { config_contable: true },
      });

      if (!sucursal || !sucursal.config_contable) {
        throw new CustomError(`Configuración contable no encontrada para la sucursal seleccionada.`);
      }

      const configContable = sucursal.config_contable;

      // 0.1️⃣ Validar que la fecha actual no exceda el límite permitido
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const fechaLimiteConfig = new Date(configContable.fechaLimite + 'T00:00:00');
      fechaLimiteConfig.setHours(0, 0, 0, 0);

      if (hoy > fechaLimiteConfig) {
        throw new CustomError("La fecha actual excede la fecha límite permitida para facturar." + hoy + "|" + fechaLimiteConfig);
      }

      // ==========================================================
      // 1️⃣ GENERAR NÚMERO DE FACTURA (CORRELATIVO)
      // ==========================================================

      let correlativo = Number(configContable.correlativoActual) + 1;
      let correlativoValido = false;

      while (!correlativoValido) {

        // Verificar si alguna factura YA usa ese número
        const facturaExistente = await strapi.db.query('api::factura.factura').findOne({
          where: { noFactura: correlativo, codigoNumFactura: configContable.codigoNumFactura },
        });

        if (!facturaExistente) {
          correlativoValido = true; // listo
        } else {
          correlativo += 1; // seguir probando
        }

        // Verificar límite máximo del rango permitido
        if (correlativo > configContable.rangoFinal) {
          throw new CustomError(
            "Se ha excedido el límite de facturas, por favor contactarse con el contador de la empresa."
          );
        }
      }

      // Asegurar que nunca sea menor al rango Inicial
      if (correlativo < configContable.rangoInicial || correlativo <= 0) {
        throw new CustomError('Correlativo de factura inválido según la configuración contable.');
      }

      // ==========================================================
      // 2️⃣ VALIDAR CONFIGURACIÓN CONTABLE DEL USUARIO
      // ==========================================================
      if (!data.usuario) {
        throw new CustomError("El usuario es requerido para generar una factura.");
      }

      const usuario = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: data.usuario, blocked: false, confirmed: true },
      });

      if (!usuario) {
        throw new CustomError("El usuario no tiene una configuración contable asignada.");
      }

      if(!data.empresa) throw new CustomError("La empresa es requerida para generar una factura.");

      // ==========================================================
      // 3️⃣ VALIDAR PRODUCTOS
      // ==========================================================
      if(!data.Productos || data.Productos.length === 0) {
        throw new CustomError("La factura debe contener al menos un producto.");
      }

      for (const detalle of data.Productos) {
        const productoExistente = await strapi.db.query('api::producto.producto').findOne({
          where: { id: detalle.producto, activo: true },
        });

        if (!productoExistente) {
          throw new CustomError(`Uno de los productos ingresados no existe o ha sido eliminado.`);
        }
        detalle.precioCompra = productoExistente.precioCompra;
      }

      // ==========================================================
      // 4️⃣ CREAR LA FACTURA
      // ==========================================================
      const factura = await strapi.db.query('api::factura.factura').create({
        data: {
          noFactura: correlativo,
          fechaLimite: configContable.fechaLimite,
          cai: configContable.cai,
          codigoNumFactura: configContable.codigoNumFactura,
          rtnCliente: data.rtnCliente,
          nombreCliente: data.nombreCliente,
          subtotal: data.subtotal,
          totalImpuestoQ: data.totalImpuestoQ || 0,
          totalImpuestoD: data.totalImpuestoD || 0,
          totalDescuento: data.totalDescuento || 0,
          total: data.total,
          totalExento: data.totalExento || 0,
          totalExonerado: data.totalExonerado || 0,
          estado: 'PAGADO',
          noCompraExenta: data.noCompraExenta,
          noConstRegExonerado: data.noConstRegExonerado,
          noSAG: data.noSAG,
          adjunto: data.adjunto,
          users_permissions_user: { connect: { id: data.usuario } },
          empresa: { connect: { id: data.empresa } },
          sucursal: { connect: { id: data.sucursal } },
        },
      });
      
      for (const detalle of data.Productos) {
        await strapi.db.query('api::detalle-factura.detalle-factura').create({
          data: {
            factura: { connect: { id: factura.id } },
            producto: { connect: { id: detalle.producto } },
            cantidad: detalle.cantidad,
            precio: detalle.precio,
            isv: detalle.isv,
            descuentoValor: detalle.descuentoValor || 0,
          },
        });
      }
      
      // ==========================================================
      // 5️⃣ CREAR MOVIMIENTOS DE INVENTARIO Y ACTUALIZAR EXISTENCIAS
      // ==========================================================

      for (const detalle of data.Productos) {
        const inventario = await strapi.db.query('api::inventario.inventario').findOne({
          where: {
            producto: detalle.producto,
            empresa: data.empresa,
            sucursal: data.sucursal,
          },
        });
        if (!inventario) {
          throw new CustomError(
            `Uno de los productos no fue encontrado, por favor revise el inventario de la sucursal.`
          );
        }

        const nuevaExistencia = inventario.existencia - detalle.cantidad;
        if (nuevaExistencia < 0) {
          throw new CustomError(
            `Uno de los productos no cuenta con suficiente existencia, por favor revise el inventario de la sucursal.`
          );
        }
        // Crear movimiento de inventario
        await strapi.db.query('api::inventario-movimiento.inventario-movimiento').create({
          data: {
            producto: { connect: { id: detalle.producto } },
            empresa: { connect: { id: data.empresa } },
            sucursal: { connect: { id: data.sucursal } },
            users_permissions_user: { connect: { id: data.usuario } },
            cantidad: detalle.cantidad,
            tipoMovimiento: 'SALIDA',
            comentario: `Venta factura #${correlativo}`,
            precioCompra: detalle.precioCompra,
            precioVenta: detalle.precio,
          },
        });


        // Actualizar inventario
        await strapi.db.query('api::inventario.inventario').update({
          where: { id: inventario.id },
          data: { existencia: nuevaExistencia },
        });
      }

      // ==========================================================
      // 6️⃣ ACTUALIZAR CORRELATIVO DE CONFIGCONTABLE
      // ==========================================================

      await strapi.db.query('api::config-contable.config-contable').update({
        where: { id: configContable.id },
        data: { correlativoActual: correlativo },
      });

      // ==========================================================
      // 7️⃣ RETORNAR FACTURA
      // ==========================================================

      return factura;
    });
  },
}));
