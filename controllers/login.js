import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

function formatDateToDDMMYYYY(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return day + '-' + month + '-' + year;
}

export const studentLoginHandler = async (req, res) => {
  // console.log('Reached');
  const { email, password } = req.body;

  const pool = {
    host: 'localhost',
    user: 'fypdba',
    password: 'fyp123',
    database: 'testdb1',
  };

  let connection;

  try {
    connection = await mysql.createConnection(pool);

    const [studentRows] = await connection.execute(
      'SELECT * FROM Student WHERE Email = ?',
      [email]
    );

    if (studentRows.length === 0 || studentRows[0].password !== password) {
      return res.status(401).json({ message: 'Authentication failed.' });
    }

    // Format the date
    studentRows[0].DOB = formatDateToDDMMYYYY(studentRows[0].DOB);

    const [projectRows] = await connection.execute(
      'SELECT * FROM Project_student WHERE regNo = ?',
      [studentRows[0].regNo]
    );

    let finalInfo = null;

    if (projectRows.length > 0) {
      const [projectInfo] = await connection.execute(
        'SELECT * FROM Project WHERE ProjectID = ?',
        [projectRows[0].ProjectID]
      );
      const [projectMembers] = await connection.execute(
        'SELECT s.* FROM Project_Student ps JOIN Student s ON ps.regNo = s.regNo WHERE ps.ProjectID = ?',
        [projectRows[0].ProjectID]
      );
      const [timeline] = await connection.execute(
        'SELECT * FROM timeline WHERE ProjectID = ?',
        [projectRows[0].ProjectID]
      );

      finalInfo = {
        ...projectInfo[0],
        ...projectRows[0],
        projectMembers: projectMembers,
        timeline: timeline,
      };
    }

    const token = jwt.sign({ email: studentRows[0].Email }, `${email}`, {
      expiresIn: '1h',
    });
    // console.log(finalInfo);
    res.status(200).json({
      studentData: studentRows[0],
      project: finalInfo,
      message: 'Login Successful',
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  } finally {
    if (connection) connection.end();
  }
};

export const supervisorLoginHandler = async (req, res) => {
  // console.log('Reached');
  // console.log(req.body);
  const { email, password } = req.body;

  const pool = {
    host: 'localhost',
    user: 'fypdba',
    password: 'fyp123',
    database: 'testdb1',
  };

  let connection;

  try {
    connection = await mysql.createConnection(pool);

    const [supervisorRows] = await connection.execute(
      'SELECT * FROM Supervisor WHERE email = ?',
      [email]
    );

    if (
      supervisorRows.length === 0 ||
      supervisorRows[0].password !== password
    ) {
      return res.status(401).json({ message: 'Authentication failed.' });
    }

    // Format the date
    supervisorRows[0].DOB = formatDateToDDMMYYYY(supervisorRows[0].DOB);

    const [projectRows] = await connection.execute(
      'SELECT * FROM Project WHERE supervisor_empID = ?',
      [supervisorRows[0].empID]
    );

    const projectsWithTimeline = await Promise.all(
      projectRows.map(async (project) => {
        const [projectMembers] = await connection.execute(
          'SELECT s.* FROM Project_Student ps JOIN Student s ON ps.regNo = s.regNo WHERE ps.ProjectID = ?',
          [project.ProjectID]
        );

        const [timeline] = await connection.execute(
          'SELECT * FROM timeline WHERE ProjectID = ?',
          [project.ProjectID]
        );

        return {
          ...project,
          projectMembers: projectMembers,
          timeline: timeline,
        };
      })
    );

    const token = jwt.sign({ email: supervisorRows[0].email }, `${email}`, {
      expiresIn: '1h',
    });
    // console.log(projectsWithTimeline[0]);

    res.status(200).json({
      supervisorData: supervisorRows[0],
      projects: await projectsWithTimeline,
      message: 'Login Successful',
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  } finally {
    if (connection) connection.end();
  }
};
