<?php

namespace App\Http\Controllers;

use App\Models\CategoryModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    public function store (Request $request){
        $validator = Validator::make($request->all(),[
            'name'=>'required|string',
            'slug'=>'required|string',
            'description'=>'nullable|string',
        ]);

        if($validator->fails()){
            return response()->json([
                'success'=>false,
                'message'=>'error validate !',
                'error'=>$validator->errors(),
            ]);
        }

        $category = CategoryModel::create([
            'name'=>$request->name,
            'slug'=>$request->slug,
            'description'=>$request->description,
            'status'=>'active',
        ]);


        return response()->json([
            'success'=>true,
            'message'=>'category created !',
            'category'=>$category,
        ]);
    }

    public function index(){
        $categories = CategoryModel::all();
        return response()->json([
            'success'=>true,
            'message'=>'get all data !',
            'categories'=>$categories,
            'category'=>$categories,
        ]);
    }

    public function update (Request $request , $id ){
        $find = CategoryModel::find($id);

        if (!$find){
            return response()->json([
                'message'=>'category not found ',

            ]);
        }

        $validator=Validator::make($request->all(),[
            'name'=>'required|string',
            'slug'=>'nullable|string',
            'description'=>'nullable|string',
        ]);

        if ($validator->fails()){
            return response()->json([
                'success'=>false,
                'message'=>'validate error',
                'error'=>$validator->errors(),

            ]);
        }

        $find->update([
            'name'=>$request->name,
            'slug'=>$request->slug,
            'description'=>$request->slug,
            'status'=>'active'
        ]);


        return response()->json([
            'success'=>true,
            'message'=>'category update successfully !',
            'categories'=>$find,

        ]);
        

    }

    public function destroy ($id){
        $find = CategoryModel::find($id);


        if (!$find){
            return response()->json([
                'message'=>'category not found !',
            ]);
        }
        
        CategoryModel::destroy($id);

        return response()->json([
            'success'=>true,
            'message'=>'delete successfully  ',
        ]);

    }

    
}
