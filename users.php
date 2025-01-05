<?php
    
    if('LOGIN' == $action){
        $email = $_POST['email'];
        $password = md5($_POST['password']);
        $sql = "SELECT *FROM $table WHERE BINARY  email = '".$email."' AND BINARY password = '".$password."'" ;
        $result = mysqli_query($db,$sql);
        $count = mysqli_num_rows($result);
        if($count == 1) {
            echo json_encode("Success");
        } else {
            echo json_encode("Error");
        }
    }

    if('LOGIN_EMAIL' == $action){
        $email = $_POST['email'];
        $sql = "SELECT *FROM $table WHERE BINARY  email = '".$email."'" ;
        $result = mysqli_query($db,$sql);
        $count = mysqli_num_rows($result);
        if($count == 1) {
            echo json_encode("Success");
        } else {
            echo json_encode("Error");
        }
    }
    
    if('GET' == $action){
        if ($db->connect_errno) {
            die("Failed to connect to MySQL: " . $db->connect_error);
        }
        $email = $_POST['email'];
        $query = "SELECT * FROM $table WHERE email = '".$email."'";
        $result = $db->query($query);
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode($data);
    }

    if('GET_CURRENT' == $action){
        if ($db->connect_errno) {
            die("Failed to connect to MySQL: " . $db->connect_error);
        }
        $uid = $_POST['uid'];
        $query = "SELECT * FROM $table WHERE uid = '".$uid."'";
        $result = $db->query($query);
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode($data);
    }

    if('GET_BY_STATUES' == $action){
        if ($db->connect_errno) {
            die("Failed to connect to MySQL: " . $db->connect_error);
        }
        $status = $_POST['status'];
        $query = "SELECT * FROM $table WHERE status = '".$status."'";
        $result = $db->query($query);
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode($data);
    }

    if('GET_ONE' == $action){
        if ($db->connect_errno) {
            die("Failed to connect to MySQL: " . $db->connect_error);
        }
        $uid = $_POST['uid'];
        $query = "SELECT * FROM $table WHERE uid = '".$uid."' AND uid != ''";
        $result = $db->query($query);
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode($data);
    }

    if('GET_ALL' == $action){
        if ($db->connect_errno) {
            die("Failed to connect to MySQL: " . $db->connect_error);
        }
        $query = "SELECT * FROM $table";
        $result = $db->query($query);
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode($data);
    }

    if('UPDATE_PROFILE' == $action){
        $image = $_FILES['image']['name'];
        $uid = $_POST['uid'];
        $username = $_POST['username'];
        $first = $_POST['first'];
        $last = $_POST['last'];

        $sqlCheckUsername = "SELECT username FROM $table WHERE uid = '$uid'";
        $resultCheckUsername = mysqli_query($db, $sqlCheckUsername);
        $row = mysqli_fetch_assoc($resultCheckUsername);
        
        if ($row['username'] !== $username) {
            $sqlCheckExistence = "SELECT username FROM $table WHERE username = '$username'";
            $resultCheckExistence = mysqli_query($db, $sqlCheckExistence);
            $count = mysqli_num_rows($resultCheckExistence);

            if ($count > 0) {
                echo 'UsernameExists';
                return;
            }
        }

        if($count == 1) {
            echo 'Exists';
        } else { 
            if (!empty($image)) {
                $imagePath = 'profile/' . $image;
                $tmp_name = $_FILES['image']['tmp_name'];
                move_uploaded_file($tmp_name, $imagePath);
            }
            $sql = "UPDATE $table SET username = '$username', first = '$first', last = '$last'";
            if (!empty($imagePath)) {
                $sql .= ", image = '$image'";
            }
    
            $sql .= " WHERE uid = '$uid'";
            if ($conn->query($sql) === TRUE) { 
                echo "success";
            } else {
                echo "error";
            }
        }

        $conn->close();
        return;
    }


    if('UPDATE' == $action){
        $uid = $_POST['uid'];
        $username = $_POST['username'];
        $first = $_POST['first'];
        $last = $_POST['last'];
        $email = $_POST['email'];
        $phone = $_POST['phone'];   
        $password = md5($_POST['password']); 
        $status = $_POST['status'];

        $sql = "UPDATE $table SET username = '$username', first = '$first', last = '$last', email = '$email', phone = '$phone', password = '$password', status = '$status' WHERE uid = '$uid'";
        if ($conn->query($sql) === TRUE) { 
            echo "success";
        } else {
            echo "error";
        }
        $conn->close();
        return;
    }

    if('UPDATE_PASS' == $action){
        $uid = $_POST['uid'];
        $password = md5($_POST['password']); 
       
        $sql = "UPDATE $table SET  password = '$password' WHERE uid = '$uid'";
        if ($conn->query($sql) === TRUE) { 
            echo "success";
        } else {
            echo "error";
        }
        $conn->close();
        return;
    }

    if('UPDATE_TOKEN' == $action){
        $uid = $_POST['uid'];
        $token = $_POST['token']; 
       
        $sql = "UPDATE $table SET  token = '$token' WHERE uid = '$uid'";
        if ($conn->query($sql) === TRUE) { 
            echo "success";
        } else {
            echo "error";
        }
        $conn->close();
        return;
    }


    if('UPDATE_EMAIL' == $action){
        $uid = $_POST['uid'];
        $email = $_POST['email']; 
       
        $sql = "SELECT email FROM $table WHERE BINARY email = '".$email."'";
        $result = mysqli_query($db,$sql);
        $count = mysqli_num_rows($result);

        if($count == 1) {
            echo 'Exists';
        } else {
            $sql = "UPDATE $table SET  email = '$email' WHERE uid = '$uid'";
            if ($conn->query($sql) === TRUE) { 
                echo "success";
            } else {
                echo "error";
            }
        }
        
        $conn->close();
        return;
    }

    if('DELETE' == $action){
        $uid = $_POST['uid'];
        $sql = "DELETE FROM $table WHERE uid = '$uid'";
        if ($conn->query($sql) === TRUE) {
            echo "success";
        } else {
            echo "error";
        }
        $conn->close();
        return;
    }
    
?>