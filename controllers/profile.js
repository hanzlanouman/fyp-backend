import mysql from 'mysql2/promise';

export const updateSupervisor = async (req, res) => {
  //   console.log(req.body);

  const { email, employeeId, contact } = req.body;
  //   console.log(email, employeeId, contact);

  const pool = {
    host: 'localhost',
    user: 'fypdba',
    password: 'fyp123',
    database: 'testdb1',
  };

  try {
    const connection = await mysql.createConnection(pool);

    await connection.execute(
      'UPDATE Supervisor SET email = ?, phone = ? WHERE empID = ?',
      [email, contact, employeeId]
    );

    const [newSup] = await connection.execute('SELECT * FROM Supervisor');

    // console.log(newSup);

    res
      .status(200)
      .json({ message: 'Supervisor information updated Successfully' });
  } catch (err) {
    console.log(err);
  } finally {
    if (connection) connection.end();
  }
};

export const updateStudent = async (req, res) => {
  const { regNo, email, phone } = req.body;
  const pool = {
    host: 'localhost',
    user: 'fypdba',
    password: 'fyp123',
    database: 'testdb1',
  };

  try {
    const connection = await mysql.createConnection(pool);

    await connection.execute(
      'UPDATE Student SET email = ?, phone = ? WHERE regNo = ?',
      [email, phone, regNo]
    );

    const [newStu] = await connection.execute('SELECT * FROM Student');

    // console.log(newStu);

    res
      .status(200)
      .json({ message: 'Supervisor information updated Successfully' });
  } catch (err) {
    console.log(err);
  } finally {
    if (connection) connection.end();
  }
};
