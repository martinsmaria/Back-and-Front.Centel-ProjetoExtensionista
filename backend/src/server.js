import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import db from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// --- Auth ---
app.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Usuário e senha são obrigatórios" });
    }

    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ? AND password = ? AND status = TRUE",
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const user = rows[0];
    return res.json({
      token: "demo-token",
      user: { username: user.username, role: user.role, name: user.name },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ message: "Erro ao processar login" });
  }
});

// --- Clients ---
app.get("/clients", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM clients WHERE status = TRUE ORDER BY id");
    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    res.status(500).json({ message: "Erro ao buscar clientes" });
  }
});

app.post("/clients", async (req, res) => {
  try {
    const { name, phone, email, cpf, cep, address } = req.body || {};
    if (!name || !phone || !cpf || !cep || !address) {
      return res.status(400).json({ message: "Campos obrigatórios ausentes" });
    }

    const [result] = await db.query(
      "INSERT INTO clients (name, phone, email, cpf, cep, address) VALUES (?, ?, ?, ?, ?, ?)",
      [name, phone, email || null, cpf, cep, address]
    );

    const newClient = {
      id: result.insertId,
      name,
      phone,
      email: email || null,
      cpf,
      cep,
      address,
    };
    res.status(201).json(newClient);
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    res.status(500).json({ message: "Erro ao criar cliente" });
  }
});

app.put("/clients/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, phone, email, cpf, cep, address } = req.body || {};

    const [result] = await db.query(
      "UPDATE clients SET name = ?, phone = ?, email = ?, cpf = ?, cep = ?, address = ? WHERE id = ? AND status = TRUE",
      [name, phone, email || null, cpf, cep, address, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }

    res.json({ id, name, phone, email, cpf, cep, address });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    res.status(500).json({ message: "Erro ao atualizar cliente" });
  }
});

app.delete("/clients/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    // Soft delete: set status to FALSE instead of deleting
    const [result] = await db.query("UPDATE clients SET status = FALSE WHERE id = ? AND status = TRUE", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }

    res.status(204).end();
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    res.status(500).json({ message: "Erro ao deletar cliente" });
  }
});

// --- Service Orders ---
app.get("/orders", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        so.id, 
        so.client_id as clientId, 
        c.name as clientName, 
        so.product, 
        so.description,
        so.date, 
        so.status, 
        so.service_class as serviceClass,
        so.observation
      FROM service_orders so
      LEFT JOIN clients c ON so.client_id = c.id
      WHERE so.active = TRUE AND c.status = TRUE
      ORDER BY 
        CASE so.service_class
          WHEN 'urgente' THEN 1
          WHEN 'data-fixa' THEN 2
          WHEN 'comum' THEN 3
        END,
        so.id DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar ordens:", error);
    res.status(500).json({ message: "Erro ao buscar ordens" });
  }
});

app.post("/orders", async (req, res) => {
  try {
    const { clientId, product, description, serviceClass } = req.body || {};
    if (!clientId || !product || !description) {
      return res.status(400).json({ message: "Campos obrigatórios ausentes" });
    }

    const [clientRows] = await db.query("SELECT * FROM clients WHERE id = ? AND status = TRUE", [
      Number(clientId),
    ]);
    if (clientRows.length === 0) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }

    const client = clientRows[0];
    const date = new Date().toISOString().slice(0, 10);
    const finalServiceClass = serviceClass || 'comum';

    const [result] = await db.query(
      "INSERT INTO service_orders (client_id, product, description, date, status, service_class, observation) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [client.id, product, description, date, "recebido", finalServiceClass, ""]
    );

    const newOrder = {
      id: result.insertId,
      clientId: client.id,
      clientName: client.name,
      product,
      description,
      date,
      status: "recebido",
      serviceClass: finalServiceClass,
      observation: "",
    };

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Erro ao criar ordem:", error);
    res.status(500).json({ message: "Erro ao criar ordem" });
  }
});

app.put("/orders/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { product, description, status, serviceClass, observation } =
      req.body || {};

    const [result] = await db.query(
      "UPDATE service_orders SET product = ?, description = ?, status = ?, service_class = ?, observation = ? WHERE id = ? AND active = TRUE",
      [product, description, status, serviceClass, observation, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "OS não encontrada" });
    }

    const [rows] = await db.query(
      `
      SELECT 
        so.id, 
        so.client_id as clientId, 
        c.name as clientName, 
        so.product, 
        so.description,
        so.date, 
        so.status, 
        so.service_class as serviceClass,
        so.observation
      FROM service_orders so
      LEFT JOIN clients c ON so.client_id = c.id
      WHERE so.id = ? AND so.active = TRUE
    `,
      [id]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar ordem:", error);
    res.status(500).json({ message: "Erro ao atualizar ordem" });
  }
});

app.patch("/orders/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body || {};

    // Validar fluxo de status Kanban
    const validStatuses = [
      'recebido',
      'em-analise',
      'aguardando-aprovacao',
      'aguardando-pecas',
      'em-manutencao',
      'em-testes',
      'pronto-entrega',
      'finalizado'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Status inválido" });
    }

    const [result] = await db.query(
      "UPDATE service_orders SET status = ? WHERE id = ? AND active = TRUE",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "OS não encontrada" });
    }

    const [rows] = await db.query(
      `
      SELECT 
        so.id, 
        so.client_id as clientId, 
        c.name as clientName, 
        so.product, 
        so.description,
        so.date, 
        so.status, 
        so.service_class as serviceClass,
        so.observation
      FROM service_orders so
      LEFT JOIN clients c ON so.client_id = c.id
      WHERE so.id = ? AND so.active = TRUE
    `,
      [id]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    res.status(500).json({ message: "Erro ao atualizar status" });
  }
});

app.patch("/orders/:id/observation", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { observation } = req.body || {};

    const [result] = await db.query(
      "UPDATE service_orders SET observation = ? WHERE id = ? AND active = TRUE",
      [observation || "", id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "OS não encontrada" });
    }

    const [rows] = await db.query(
      `
      SELECT 
        so.id, 
        so.client_id as clientId, 
        c.name as clientName, 
        so.product, 
        so.description,
        so.date, 
        so.status, 
        so.service_class as serviceClass,
        so.observation
      FROM service_orders so
      LEFT JOIN clients c ON so.client_id = c.id
      WHERE so.id = ? AND so.active = TRUE
    `,
      [id]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar observação:", error);
    res.status(500).json({ message: "Erro ao atualizar observação" });
  }
});

app.delete("/orders/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    // Soft delete: set active to FALSE instead of deleting
    const [result] = await db.query("UPDATE service_orders SET active = FALSE WHERE id = ? AND active = TRUE", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "OS não encontrada" });
    }

    res.status(204).end();
  } catch (error) {
    console.error("Erro ao deletar ordem:", error);
    res.status(500).json({ message: "Erro ao deletar ordem" });
  }
});

// --- Items (Stock) ---
app.get("/items", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM items WHERE status = TRUE ORDER BY id");
    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar itens:", error);
    res.status(500).json({ message: "Erro ao buscar itens" });
  }
});

app.post("/items", async (req, res) => {
  try {
    const { name, brand, model, quantity } = req.body || {};
    if (!name) {
      return res.status(400).json({ message: "Nome é obrigatório" });
    }

    const [result] = await db.query(
      "INSERT INTO items (name, brand, model, quantity) VALUES (?, ?, ?, ?)",
      [name, brand || null, model || null, Number(quantity) || 0]
    );

    const newItem = {
      id: result.insertId,
      name,
      brand: brand || null,
      model: model || null,
      quantity: Number(quantity) || 0,
    };

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Erro ao criar item:", error);
    res.status(500).json({ message: "Erro ao criar item" });
  }
});

app.put("/items/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, brand, model, quantity } = req.body || {};

    const [result] = await db.query(
      "UPDATE items SET name = ?, brand = ?, model = ?, quantity = ? WHERE id = ? AND status = TRUE",
      [name, brand || null, model || null, Number(quantity) || 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item não encontrado" });
    }

    res.json({ id, name, brand, model, quantity: Number(quantity) || 0 });
  } catch (error) {
    console.error("Erro ao atualizar item:", error);
    res.status(500).json({ message: "Erro ao atualizar item" });
  }
});

app.delete("/items/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    // Soft delete: set status to FALSE instead of deleting
    const [result] = await db.query("UPDATE items SET status = FALSE WHERE id = ? AND status = TRUE", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item não encontrado" });
    }

    res.status(204).end();
  } catch (error) {
    console.error("Erro ao deletar item:", error);
    res.status(500).json({ message: "Erro ao deletar item" });
  }
});

app.patch("/items/:id/adjust", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { amount } = req.body || {};

    if (typeof amount !== "number") {
      return res.status(400).json({ message: "amount deve ser numérico" });
    }

    const [itemRows] = await db.query("SELECT * FROM items WHERE id = ? AND status = TRUE", [id]);

    if (itemRows.length === 0) {
      return res.status(404).json({ message: "Item não encontrado" });
    }

    const item = itemRows[0];
    const newQty = item.quantity + amount;

    if (newQty < 0) {
      return res
        .status(400)
        .json({ message: "Quantidade não pode ser negativa" });
    }

    await db.query("UPDATE items SET quantity = ? WHERE id = ? AND status = TRUE", [newQty, id]);

    res.json({ ...item, quantity: newQty });
  } catch (error) {
    console.error("Erro ao ajustar quantidade:", error);
    res.status(500).json({ message: "Erro ao ajustar quantidade" });
  }
});

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "centel-backend" });
});

// Error handling middleware (must be after all routes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Erro interno do servidor", error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Rota não encontrada" });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API running on http://localhost:${PORT}`);
});
